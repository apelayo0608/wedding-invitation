export function selectApiBase(configuredBase = '', isDevelopment = false) {
  return configuredBase || (isDevelopment ? '/api/kath' : 'https://events.fitacademy.ph/api/kath');
}

const API_BASE = selectApiBase(
  typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_API_BASE : '',
  typeof import.meta.env !== 'undefined' && Boolean(import.meta.env.DEV),
);

export function joinApiUrl(base, path) {
  return `${String(base).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

export function resolveApiAssetUrl(value, base = API_BASE) {
  if (!value) return '';
  try { return new URL(value, base).toString(); } catch { return value; }
}

export function validatePasswordChange({ currentPassword = '', newPassword = '', confirmPassword = '' } = {}) {
  const errors = {};
  if (!String(currentPassword).trim()) errors.currentPassword = 'Enter your current password.';
  if (String(newPassword).length < 10) errors.newPassword = 'Use at least 10 characters for your new password.';
  if (String(newPassword) !== String(confirmPassword)) errors.confirmPassword = 'New passwords do not match.';
  return errors;
}

export async function apiRequest(path, options = {}) {
  const isAdminMutation = path.startsWith('/admin/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase());
  let requestBody = options.body && typeof options.body !== 'string' ? { ...options.body } : options.body;
  if (isAdminMutation && requestBody && typeof requestBody === 'object' && window.__csrf) requestBody.csrf = window.__csrf;
  const response = await fetch(joinApiUrl(API_BASE, path), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: requestBody && typeof requestBody !== 'string' ? JSON.stringify(requestBody) : requestBody,
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const error = new Error(payload?.message || 'Something went wrong.');
    error.code = payload?.code;
    error.fields = payload?.fields;
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function getPublicEvent() {
  try {
    const response = await apiRequest('/public/event');
    const data = response.data || response;
    return { ...data, musicUrl: resolveApiAssetUrl(data.musicUrl) };
  } catch {
    return null;
  }
}

export async function submitRsvp(data, replace = false) {
  const response = await apiRequest('/public/rsvps', { method: 'POST', body: { ...data, replace } });
  return response.data || response;
}

export async function adminLogin(credentials) {
  const response = await apiRequest('/admin/login', { method: 'POST', body: credentials });
  window.__csrf = response.data?.csrf || '';
  return response.data || response;
}

export async function changeAdminPassword(credentials) {
  const response = await apiRequest('/admin/password', { method: 'POST', body: credentials });
  window.__csrf = response.data?.csrf || window.__csrf || '';
  return response.data || response;
}

export async function getAdminSession() {
  const response = await apiRequest('/admin/session');
  window.__csrf = response.data?.csrf || window.__csrf || '';
  return response.data || response;
}

export async function saveAdminEvent(event) {
  const response = await apiRequest('/admin/event', { method: 'PUT', body: {
    bride: event.couple.bride,
    groom: event.couple.groom,
    wedding_at: event.couple.date.slice(0, 19).replace('T', ' '),
    rsvp_deadline: event.rsvpDeadline.slice(0, 19).replace('T', ' '),
    max_companions: event.maxCompanions,
    attire: event.attire,
    gift_note: event.giftNote,
    gallery_url: event.galleryUrl,
    gallery_published: event.galleryPublished ? 1 : 0,
  } });
  await apiRequest('/admin/venues', { method: 'PUT', body: {
    ceremony: { name: event.ceremony.name, address: event.ceremony.address, mapsUrl: event.ceremony.mapsUrl, embedUrl: event.ceremony.embedUrl || '' },
    reception: { name: event.reception.name, address: event.reception.address, mapsUrl: event.reception.mapsUrl, embedUrl: event.reception.embedUrl || '' },
  } });
  return response.data || response;
}

export async function getAdminRsvps() {
  const response = await apiRequest('/admin/rsvps');
  return response.data || response;
}

export async function saveAdminSponsors(groups) {
  const response = await apiRequest('/admin/sponsors', { method: 'PUT', body: { groups } });
  return response.data || response;
}

export async function uploadAdminFile(kind, file) {
  const form = new FormData();
  form.append('file', file);
  form.append('csrf', window.__csrf || '');
  const response = await fetch(joinApiUrl(API_BASE, `/admin/uploads/${kind}`), { method: 'POST', credentials: 'include', body: form });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Upload failed.');
  const data = payload.data || payload;
  return { ...data, url: resolveApiAssetUrl(data.url) };
}

export async function exportAdminRsvps() {
  const response = await fetch(joinApiUrl(API_BASE, '/admin/rsvps/export.xlsx'), { credentials: 'include' });
  if (!response.ok) throw new Error('Excel export is not available yet.');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'kathreen-lawrence-rsvps.xlsx'; link.click(); URL.revokeObjectURL(url);
}

export async function deleteAdminRsvp(id) {
  const response = await apiRequest(`/admin/rsvps/${id}`, { method: 'DELETE', body: {} });
  return response.data || response;
}
