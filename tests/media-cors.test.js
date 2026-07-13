import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('loads wedding music through an explicit cross-origin audio request', () => {
  const invitation = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const mediaHandler = readFileSync(new URL('../api/private-media.php', import.meta.url), 'utf8');

  assert.match(invitation, /<audio[^>]*crossOrigin="anonymous"[^>]*preload="auto"/);
  assert.match(mediaHandler, /Access-Control-Allow-Origin/);
  assert.match(mediaHandler, /allowed_origins/);
});
