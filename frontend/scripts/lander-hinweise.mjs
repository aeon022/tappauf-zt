// Richtet in Landers Redaktion die Hinweis-Felder ein (einmalig, kann wiederholt werden):
//   «Hinweis» (z. B. Betriebsurlaub, Neuigkeit) und «Urlaub / Schließzeit», jeweils als Einzelseite, zunächst ausgeschaltet.
// Aufruf:  LANDER_USER=… LANDER_PASS=… node scripts/lander-hinweise.mjs https://www.tappauf-zt.at/lander
const base = (process.argv[2] || '').replace(/\/$/, '');
const user = process.env.LANDER_USER, pass = process.env.LANDER_PASS;
if (!base || !user || !pass) { console.error('Aufruf: LANDER_USER=… LANDER_PASS=… node scripts/lander-hinweise.mjs <Lander-Adresse>'); process.exit(1); }
const origin = new URL(base).origin;
let cookie = '';
const api = async (path, method = 'GET', body) => {
  const r = await fetch(base + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const c = r.headers.get('set-cookie'); if (c) cookie = c.split(';')[0];
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${j?.error ?? ''}`);
  return j;
};
const felder = {
  active: { type: 'boolean', label: 'Anzeigen' },
  title: { type: 'string', label: 'Titel (steht in der Leiste)', required: true },
  text: { type: 'richtext', label: 'Text im Pop-up (Markdown: fett, Listen, Links)' },
  cta: { type: 'string', label: 'Knopf-Text (optional)' },
  href: { type: 'string', label: 'Knopf-Ziel (z. B. /kontakt/, optional)' },
  popup: { type: 'boolean', label: 'Zusätzlich als Pop-up öffnen' },
  from: { type: 'date', label: 'Anzeigen ab (optional)' },
  until: { type: 'date', label: 'Anzeigen bis (optional)' },
};
await api('/api/auth/login', 'POST', { username: user, password: pass });
const cols = await api('/api/collections');
for (const [id, label, titel] of [['hinweis', 'Hinweis', 'Neuigkeit'], ['urlaub', 'Urlaub / Schließzeit', 'Büro geschlossen']]) {
  if (cols.some((c) => c.id === id)) await api(`/api/collections/${id}`, 'PUT', { label, schema: felder, singleton: true });
  else await api('/api/collections', 'POST', { id, label, singleton: true, schema: felder });
  const e = await api(`/api/collections/${id}/singleton`).catch(() => null);
  const has = e && e.data && Object.keys(typeof e.data === 'string' ? JSON.parse(e.data) : e.data).length;
  if (!has) {
    const data = { active: false, title: titel, text: '', cta: '', href: '', popup: false, from: '', until: '' };
    if (e?.slug) await api(`/api/collections/${id}/entries/${encodeURIComponent(e.slug)}`, 'PUT', { status: 'published', data });
    else await api(`/api/collections/${id}/entries`, 'POST', { slug: 'main', status: 'published', data });
  }
  console.log(`«${id}» bereit (ausgeschaltet; Titel nur ein Platzhalter)`);
}
