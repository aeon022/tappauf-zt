// Einmalig: überträgt die bisherigen Inhalte (src/content/**/*.mdoc, Bilder, PDF) in ein Lander.
// Aufruf:  LANDER_USER=… LANDER_PASS=… node scripts/migrate-to-lander.mjs http://localhost:8091
// Kann wiederholt werden (vorhandene Einträge werden aktualisiert, Medien nur einmal hochgeladen).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.argv[2] || '').replace(/\/$/, '');
const { LANDER_USER: user, LANDER_PASS: pass } = process.env;
if (!base || !user || !pass) { console.error('Aufruf: LANDER_USER=… LANDER_PASS=… node scripts/migrate-to-lander.mjs <Lander-Adresse>'); process.exit(1); }
const origin = new URL(base).origin;
let cookie = '';
const api = async (path, method = 'GET', body) => {
  const form = body instanceof FormData;
  const r = await fetch(base + path, { method, headers: { Origin: origin, ...(form ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { cookie } : {}) }, body: body ? (form ? body : JSON.stringify(body)) : undefined });
  const c = r.headers.get('set-cookie'); if (c) cookie = c.split(';')[0];
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${j?.error ?? ''}`);
  return j;
};

const s = (label, extra = {}) => ({ type: 'string', label, ...extra });
const t = (label) => s(label, { multiline: true });
const img = (label) => ({ type: 'image', label });
const num = (label) => ({ type: 'number', label });
const body = (label) => ({ type: 'richtext', label });

// id → { label, singleton, dir (Ordner mit .mdoc), schema }
const C = {
  settings: { label: 'Allgemein (Kontakt, Firma)', singleton: true, dir: 'settings', schema: {
    siteTitle: s('Titel'), siteSubtitle: s('Untertitel'), logo: img('Logo'), logoAlt: s('Logo Alt-Text'),
    siteDescription: t('Beschreibung'), metaDescription: t('Meta-Beschreibung (Suchmaschinen)'),
    email: s('E-Mail'), phone: s('Telefon'), address: t('Adresse'), googleMapsEmbed: s('Google Maps Embed-URL'), googleMapsLink: s('Google Maps Link'),
    companyDetails: t('Firmendaten (Impressum)'), facebook: s('Facebook'), x: s('X'), instagram: s('Instagram'), tiktok: s('TikTok'), linkedin: s('LinkedIn'), youtube: s('YouTube'), body: body('Zusatzinhalt') } },
  home: { label: 'Startseite', singleton: true, dir: 'home', schema: {
    title: s('Interner Name'), heroEyebrow: s('Hero Eyebrow'), heroHeadline: s('Hero Headline'), heroText: t('Hero Text'), heroImage: img('Hero Bild'), heroImageAlt: s('Hero Bild Alt-Text'),
    heroPrimaryLabel: s('Hero Button 1 Text'), heroPrimaryHref: s('Hero Button 1 Link'), heroSecondaryLabel: s('Hero Button 2 Text'), heroSecondaryHref: s('Hero Button 2 Link'),
    aboutTitle: s('Über uns: Titel'), aboutText: t('Über uns: Text'), profileTitle: s('Profil: Titel'), profileHeadline: s('Profil: Headline'),
    approachTitle: s('Arbeitsweise: Titel'), approachText: t('Arbeitsweise: Text'), insuranceTitle: s('Versicherung: Titel'), insuranceText: t('Versicherung: Text'),
    partnersTitle: s('Partner: Titel'), partnersText: t('Partner: Text'), publicationsTitle: s('Publikationen: Titel'), publicationsText: t('Publikationen: Text'),
    referencesTitle: s('Referenzen: Titel'), referencesText: t('Referenzen: Text'), body: body('Zusätzlicher Inhalt') } },
  references: { label: 'Referenzen (Projekte)', dir: 'references/entries', schema: {
    title: s('Projekttitel', { required: true }), details: s('Details / Auftraggeber'),
    category: { type: 'select', label: 'Kategorie', options: ['hochbau', 'tiefbau', 'industrie', 'bruecken', 'sonderprojekte'] },
    year: s('Jahr (z. B. 2024)'), client: s('Auftraggeber'), heroImage: img('Hauptbild'), order: num('Sortierung'), body: body('Beschreibung') } },
  services: { label: 'Leistungen', dir: 'services/entries', schema: {
    title: s('Leistung', { required: true }), summary: t('Kurzbeschreibung'), image: img('Vorschaubild'), items: { type: 'array', label: 'Leistungsbausteine (Komma-getrennt)' }, order: num('Sortierung'), body: body('Detaillierte Beschreibung') } },
  team: { label: 'Team', dir: 'team/entries', schema: {
    name: s('Vollständiger Name', { required: true }), role: s('Position / Rolle'), qualification: t('Zusatz / Qualifikation'), phone: s('Telefon'), email: s('E-Mail'), image: img('Porträtfoto'), order: num('Sortierung'), body: body('Profiltext') } },
  jobs: { label: 'Jobs', dir: 'jobs', schema: {
    title: s('Stellentitel', { required: true }), order: num('Sortierung'), status: { type: 'select', label: 'Status', options: ['aktiv', 'archiviert'] },
    summary: t('Kurzbeschreibung'), location: s('Standort'), workload: s('Arbeitszeit'), employmentType: s('Anstellungsart'), applyEmail: s('Bewerbungs-E-Mail'), body: body('Beschreibung') } },
  partners: { label: 'Auftraggeber & Partner', dir: 'partners/entries', schema: {
    name: s('Name', { required: true }), logo: img('Logo'), website: s('Website / Link'), order: num('Sortierung'), body: body('Zusatzinhalt') } },
  publications: { label: 'Publikationen', dir: 'publications/entries', schema: {
    title: s('Titel', { required: true }), year: num('Jahr'), citation: t('Zitat / Quelle'), pdfFile: { type: 'file', label: 'PDF' }, pdfUrl: s('PDF-Link (extern)'), order: num('Sortierung'), body: body('Zusatzinhalt') } },
};

await api('/api/auth/login', 'POST', { username: user, password: pass });
console.log('angemeldet als', user);

// Medien: jede Datei nur einmal hochladen (Schlüssel = absoluter Pfad)
const media = new Map();
async function upload(abs, alt) {
  if (media.has(abs)) return media.get(abs);
  const fd = new FormData();
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' }[extname(abs).toLowerCase()];
  if (!mime || mime === 'image/svg+xml') { console.log('  übersprungen (Typ):', basename(abs)); media.set(abs, null); return null; }
  fd.append('file', new Blob([readFileSync(abs)], { type: mime }), basename(abs));
  if (alt) fd.append('alt', String(alt));
  fd.append('folder', extname(abs).toLowerCase() === '.pdf' ? 'publikationen' : 'bilder');
  const m = await api('/api/media', 'POST', fd);
  media.set(abs, m.id);
  return m.id;
}

const existing = new Map((await api('/api/collections')).map((c) => [c.id, c]));
for (const [id, c] of Object.entries(C)) {
  const body = { id, label: c.label, schema: c.schema, singleton: !!c.singleton };
  if (existing.has(id)) await api(`/api/collections/${id}`, 'PUT', body); else await api('/api/collections', 'POST', body);
  const dir = join(root, 'src/content', c.dir);
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdoc')).sort();
  let n = 0;
  const slugs = [];
  for (const f of files) {
    const raw = readFileSync(join(dir, f), 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) { console.log('  ohne Frontmatter:', f); continue; }
    const fm = yaml.load(m[1]) ?? {};
    const text = m[2].trim();
    if (text.includes('{%')) console.log('  Markdoc-Tag in', f, '– bitte prüfen');
    const data = {};
    for (const [k, def] of Object.entries(c.schema)) {
      if (k === 'body') { data.body = text; continue; }
      let v = fm[k];
      if (v === undefined || v === null || v === '') continue;
      if (def.type === 'image' || def.type === 'file') {
        const abs = resolve(dir, String(v));
        const abs2 = def.type === 'file' ? resolve(root, 'public', String(v).replace(/^\//, '')) : abs;
        const p = existsSync(abs2) && statSync(abs2).isFile() ? abs2 : null;
        if (!p) { console.log(`  Datei fehlt (${f}.${k}):`, v); continue; }
        const alt = k === 'heroImage' && fm.heroImageAlt ? fm.heroImageAlt : k === 'logo' && fm.logoAlt ? fm.logoAlt : (fm.name || fm.title);
        v = await upload(p, alt);
        if (!v) continue;
      }
      if (def.type === 'number') v = Number(v);
      if (def.type === 'array') v = Array.isArray(v) ? v : String(v).split(',').map((x) => x.trim());
      data[k] = v;
    }
    const slug = c.singleton ? 'main' : basename(f, '.mdoc');
    const status = 'published';
    const has = await api(`/api/collections/${id}/entries/${slug}`).then(() => true).catch(() => false);
    if (has) await api(`/api/collections/${id}/entries/${slug}`, 'PUT', { data, status });
    else await api(`/api/collections/${id}/entries`, 'POST', { slug, data, status });
    slugs.push(slug); n++;
  }
  if (!c.singleton && slugs.length) await api(`/api/collections/${id}/entries/reorder`, 'PATCH', { slugs });
  console.log(`${id}: ${n} Einträge`);
}
console.log(`Medien hochgeladen: ${[...media.values()].filter(Boolean).length}`);
