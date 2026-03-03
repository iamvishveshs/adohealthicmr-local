/**
 * Proxy requests to Express API when EXPRESS_API_URL is set.
 * Enables SQLite-backed persistence for all app data.
 */

const BASE = process.env.EXPRESS_API_URL || '';

export function isExpressEnabled(): boolean {
  return !!BASE && BASE.length > 0;
}

export async function proxyToExpress(
  path: string,
  init?: RequestInit
): Promise<Response> {
  if (!BASE) {
    throw new Error('EXPRESS_API_URL is not set');
  }
  const url = `${BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  return fetch(url, {
    ...init,
    headers,
  });
}

