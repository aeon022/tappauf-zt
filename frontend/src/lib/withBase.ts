export function withBase(path: string) {
  if (!path || !path.startsWith('/')) return path;

  const base = import.meta.env.BASE_URL || '/';
  if (base === '/') return path;

  return `${base.replace(/\/$/, '')}${path}`;
}
