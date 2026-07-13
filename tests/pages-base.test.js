import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('uses relative production asset paths for both GitHub Pages URLs', () => {
  const config = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');

  assert.match(config, /base:\s*command\s*===\s*'build'\s*\?\s*'\.\/'\s*:\s*'\/'/);
});
