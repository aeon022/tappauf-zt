// Baut die Website für den Webhost: node scripts/build-live.mjs [Lander-Adresse zum Lesen]
//  • Lesen: PUBLIC_LANDER_URL / erstes Argument (Standard: die Live-Adresse, Lander muss dann schon online sein).
//  • Mit lokalem Lander (z. B. http://localhost:8091) werden danach alle Adressen in dist/ auf die Live-Adresse umgeschrieben.
// Live-Adresse: LIVE_LANDER_URL, sonst https://www.tappauf-zt.at/lander
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const live = (process.env.LIVE_LANDER_URL || 'https://www.tappauf-zt.at/lander').replace(/\/$/, '');
const from = (process.argv[2] || process.env.PUBLIC_LANDER_URL || live).replace(/\/$/, '');
execSync('npx astro build', { stdio: 'inherit', env: { ...process.env, PUBLIC_LANDER_URL: from } });

if (from !== live) {
  const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
  let changed = 0;
  for (const f of walk('dist')) {
    if (!/\.(html|js|css|json|xml|txt|svg|webmanifest)$/.test(f)) continue;
    const s = readFileSync(f, 'utf8');
    if (!s.includes(from)) continue;
    writeFileSync(f, s.split(from).join(live)); changed++;
  }
  console.log(`Adressen umgeschrieben: ${from} → ${live} (${changed} Dateien)`);
}
const left = [];
for (const f of readdirSync('dist', { recursive: true })) {
  const p = join('dist', String(f));
  if (!statSync(p).isFile() || !/\.(html|js|css|json|xml|txt)$/.test(p)) continue;
  if (/localhost|127\.0\.0\.1/.test(readFileSync(p, 'utf8'))) left.push(p);
}
if (left.length) { console.error('FEHLER: lokale Adressen in', left.slice(0, 5).join(', ')); process.exit(1); }
console.log('dist/ ist bereit zum Hochladen.');
