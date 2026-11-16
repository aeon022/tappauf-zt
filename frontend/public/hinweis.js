// Holt die aktuellen Hinweise zur Laufzeit aus Lander («urlaub» und «hinweis»); ein neuer Text greift ohne Neubau.
// Antwortet Lander, gilt dessen Inhalt (auch «aus»). Ist Lander nicht erreichbar, bleibt der Stand aus dem Quelltext.
(async () => {
  // Ordner, in dem die Seite liegt (live «/», Testserver «/html/pina-entwurf/»): aus der Adresse dieses Skripts.
  const BASE = (() => { try { return new URL(document.currentScript.src).pathname.replace(/hinweis\.js$/, ''); } catch { return '/'; } })();
  const mitBasis = (u) => (typeof u === 'string' && u.startsWith('/') && !u.startsWith('//') && !u.startsWith(BASE) ? BASE + u.slice(1) : u);
  const bar = document.getElementById('hinweis-bar');
  const dlg = document.getElementById('hinweis-dialog');
  const KLASSE = 'flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full py-2 pl-4 pr-2 text-[0.8125rem] font-semibold tracking-wide text-white no-underline transition hover:text-blue-300 sm:gap-3 sm:pl-6 sm:pr-3 sm:text-sm';
  const heute = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Vienna' });
  const istLive = (h) => !!h && !!h.active && !!h.title && (!h.from || h.from <= heute) && (!h.until || h.until >= heute);

  // Markdown, bewusst klein und sicher: Absätze, Listen, Überschriften (## / ###), **fett**, *kursiv*, [Text](Link). Rohes HTML wird als Text gezeigt.
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const inline = (s) => esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/.test(u) ? `<a href="${mitBasis(u)}">${t}</a>` : t))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  const md = (src) => String(src || '').replace(/\r/g, '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean).map((b) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-*] /.test(l))) return '<ul>' + lines.map((l) => `<li>${inline(l.replace(/^\s*[-*] /, ''))}</li>`).join('') + '</ul>';
    const h = /^(#{1,3}) (.+)$/.exec(b);
    if (h && lines.length === 1) return `<h3>${inline(h[2])}</h3>`;
    return '<p>' + lines.map(inline).join('<br />') + '</p>';
  }).join('');

  const hol = async (name) => { try { const r = await fetch(bar.dataset.lander + '/api/public/' + name); return r.ok ? { active: false, ...((await r.json()).data || {}) } : null; } catch { return undefined; } };
  let urlaub = null, status = null;
  if (bar?.dataset.lander) { urlaub = await hol('urlaub'); status = await hol('hinweis'); }
  if (urlaub === undefined || status === undefined) return; // Lander nicht erreichbar: der Stand aus dem Quelltext bleibt
  const live = [urlaub, status].filter(istLive);
  const mitText = live.filter((h) => h.text || (h.cta && h.href));

  // Pille
  const pille = bar?.querySelector('#hinweis-pille');
  const erste = live[0];
  if (pille) {
    pille.textContent = '';
    if (erste) {
      const el = document.createElement(erste.href ? 'a' : 'button');
      el.className = KLASSE;
      if (erste.href) el.href = mitBasis(erste.href); else { el.type = 'button'; el.dataset.hinweisAuf = ''; }
      const t = document.createElement('span'); t.textContent = erste.title; el.append(t);
      const extra = erste.cta || (!erste.href && mitText.length ? 'Mehr' : '');
      if (extra) { const d = document.createElement('span'); d.setAttribute('aria-hidden', 'true'); d.textContent = '·'; const c = document.createElement('span'); c.className = 'underline underline-offset-4'; c.textContent = extra; el.append(d, c); }
      pille.append(el);
    }
  }
  let zu = false; try { zu = !!sessionStorage.getItem('hinweis-zu'); } catch {}
  if (bar) bar.hidden = !erste || zu;
  bar?.querySelector('[data-hinweis-zu]')?.addEventListener('click', () => { bar.hidden = true; try { sessionStorage.setItem('hinweis-zu', '1'); } catch {} });
  bar?.addEventListener('click', (e) => { if (e.target.closest('[data-hinweis-auf]')) dlg?.showModal(); });

  // Pop-up
  if (!dlg) return;
  const liste = dlg.querySelector('#hinweis-liste');
  if (liste) {
    liste.textContent = '';
    mitText.forEach((h, i) => {
      const a = document.createElement('article');
      const t = document.createElement('h2'); t.className = 'mb-4 text-2xl font-semibold tracking-[-0.02em]'; if (i === 0) t.id = 'hinweis-titel'; t.textContent = h.title; a.append(t);
      if (h.text) { const p = document.createElement('div'); p.className = 'prose prose-slate'; p.innerHTML = md(h.text); a.append(p); }
      if (h.cta && h.href) { const p = document.createElement('p'); p.className = 'mt-6'; const l = document.createElement('a'); l.className = 'inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white no-underline transition hover:bg-blue-500'; l.href = mitBasis(h.href); const s = document.createElement('span'); s.textContent = h.cta; l.append(s); p.append(l); a.append(p); }
      liste.append(a);
    });
  }
  try {
    if (live.some((h) => h.popup) && !location.search.includes('nopopup') && !sessionStorage.getItem('hinweis-gesehen')) { dlg.showModal(); sessionStorage.setItem('hinweis-gesehen', '1'); }
  } catch { /* Storage gesperrt: kein Pop-up, die Leiste genügt */ }
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
})();
