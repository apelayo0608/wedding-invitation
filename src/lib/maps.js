const GOOGLE_MAP_HOSTS = new Set(['www.google.com', 'google.com', 'maps.google.com']);

export function isValidMapEmbedUrl(value = '') {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'https:' && GOOGLE_MAP_HOSTS.has(url.hostname.toLowerCase()) && url.pathname.startsWith('/maps/embed');
  } catch {
    return false;
  }
}
