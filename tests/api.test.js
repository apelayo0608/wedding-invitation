import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { changeAdminPassword, joinApiUrl, resolveApiAssetUrl, selectApiBase, validatePasswordChange } from '../src/api.js';

test('joins an API base and endpoint without duplicate slashes', () => {
  assert.equal(joinApiUrl('https://events.fitacademy.ph/api/kathreen/', '/admin/session'), 'https://events.fitacademy.ph/api/kathreen/admin/session');
  assert.equal(joinApiUrl('/api', 'public/event'), '/api/public/event');
});

test('uses the same-site API proxy while running Vite locally', () => {
  assert.equal(selectApiBase('', true), '/api/kath');
  assert.equal(selectApiBase('https://events.fitacademy.ph/api/kath', true), 'https://events.fitacademy.ph/api/kath');
  assert.equal(selectApiBase('', false), 'https://events.fitacademy.ph/api/kath');
});

test('resolves media URLs against the API host', () => {
  assert.equal(resolveApiAssetUrl('/api/private-media.php?file=music.mp3', 'https://events.fitacademy.ph/api/kath'), 'https://events.fitacademy.ph/api/private-media.php?file=music.mp3');
  assert.equal(resolveApiAssetUrl('https://cdn.example.test/music.mp3', 'https://events.fitacademy.ph/api/kath'), 'https://cdn.example.test/music.mp3');
});

test('validates an admin password change before submitting it', () => {
  assert.deepEqual(validatePasswordChange({ currentPassword: '', newPassword: 'short', confirmPassword: 'different' }), {
    currentPassword: 'Enter your current password.',
    newPassword: 'Use at least 10 characters for your new password.',
    confirmPassword: 'New passwords do not match.',
  });
  assert.deepEqual(validatePasswordChange({ currentPassword: 'old-password', newPassword: 'new-password-123', confirmPassword: 'new-password-123' }), {});
});

test('submits the password change to the authenticated admin endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  let request;
  globalThis.window = { __csrf: 'csrf-token' };
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ data: { changed: true, csrf: 'next-token' } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const result = await changeAdminPassword({ currentPassword: 'old-password', newPassword: 'new-password-123', confirmPassword: 'new-password-123' });
    assert.equal(result.changed, true);
    assert.equal(request.url, 'https://events.fitacademy.ph/api/kath/admin/password');
    assert.equal(JSON.parse(request.options.body).csrf, 'csrf-token');
    assert.equal(globalThis.window.__csrf, 'next-token');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test('keeps uploaded music inside the deployed API folder', () => {
  const config = readFileSync(new URL('../api/config.php', import.meta.url), 'utf8');
  assert.match(config, /'uploads_dir'\s*=>\s*__DIR__\s*\.\s*'\/uploads'/);
  assert.match(config, /'uploads_url'\s*=>\s*'\/api\/kath\/private-media\.php\?file='/);
  assert.equal(existsSync(new URL('../api/uploads/.gitkeep', import.meta.url)), true);
});
