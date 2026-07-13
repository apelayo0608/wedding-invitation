import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('builds a dedicated static entry for the admin route', () => {
  const config = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
  const adminHtml = new URL('../admin/index.html', import.meta.url);

  assert.equal(existsSync(adminHtml), true);
  assert.match(readFileSync(adminHtml, 'utf8'), /src="\.\.\/src\/main\.jsx"/);
  assert.match(config, /input:\s*\{\s*main:\s*'index\.html',\s*admin:\s*'admin\/index\.html'\s*\}/);
});
