// Inhalte kommen aus Lander (Redaktion auf dem PHP-Webhost). Beim Bauen wird die öffentliche Lese-API gelesen;
// die Form entspricht dem früheren `astro:content` (id, data, body), damit Seiten und Bausteine gleich bleiben.
import { marked } from 'marked';

export const LANDER = String(import.meta.env.PUBLIC_LANDER_URL ?? '').replace(/\/$/, '');

type Raw = { slug: string; data: Record<string, any> };
export type Entry = { id: string; data: any; body: string };

const cache = new Map<string, Promise<any>>();
const get = (name: string) => {
  if (!LANDER) throw new Error('PUBLIC_LANDER_URL fehlt (Adresse von Lander, z. B. https://redaktion.tappauf-zt.at). Siehe README.');
  if (!cache.has(name)) {
    cache.set(name, fetch(`${LANDER}/api/public/${name}`).then((r) => {
      if (!r.ok) throw new Error(`Lander ${name}: HTTP ${r.status}`);
      return r.json();
    }));
  }
  return cache.get(name)!;
};

// Bild-/Dateifelder liefert Lander als {id,url,alt,type}; `src` bleibt als Alias für den bisherigen Code.
const withSrc = (v: any): any => (v && typeof v === 'object' && !Array.isArray(v) && v.url && v.id ? { ...v, src: v.url } : v);
const toEntry = (e: Raw): Entry => {
  const { body = '', ...data } = e.data ?? {};
  for (const k of Object.keys(data)) data[k] = withSrc(data[k]);
  return { id: e.slug, data, body: String(body) };
};

export async function getCollection(name: string): Promise<Entry[]> {
  const list = await get(name);
  return (Array.isArray(list) ? list : [list]).filter((e) => e?.slug).map(toEntry);
}
/** Einzelseiten (settings, home) oder ein Eintrag einer Sammlung. */
export async function getEntry(name: string, id?: string): Promise<Entry | undefined> {
  const r = await get(name);
  if (!Array.isArray(r)) return r?.slug ? toEntry(r) : undefined;
  return r.map(toEntry).find((e) => e.id === id);
}

marked.use({ renderer: { html: () => '' } }); // rohes HTML aus dem Editor wird verworfen
export const markdown = (md = '') => marked.parse(md, { async: false }) as string;
