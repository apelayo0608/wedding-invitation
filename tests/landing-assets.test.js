import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('uses the Kath landing assets on the welcome screen', () => {
  const source = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

  assert.equal(existsSync(new URL('../src/assets/landing-page.jpg', import.meta.url)), true);
  assert.equal(existsSync(new URL('../src/assets/monogram.png', import.meta.url)), true);
  assert.match(source, /import monogramImage from ['"]\.\/assets\/monogram\.png['"]/);
  assert.match(source, /className="welcome-monogram"/);
  assert.match(source, /alt="Kathreen and Lawrence monogram"/);
  assert.match(styles, /url\(['"]\.\/assets\/landing-page\.jpg['"]\)/);
});
