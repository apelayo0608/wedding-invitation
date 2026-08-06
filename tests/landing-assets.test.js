import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('uses the Kath landing assets on the welcome screen', () => {
  const source = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const monogram = readFileSync(new URL('../src/assets/monogram.png', import.meta.url));
  const welcomeCard = source.match(/<div className="welcome-card">([\s\S]*?)<\/div>/)?.[1] || '';

  assert.equal(existsSync(new URL('../src/assets/landing-page.jpg', import.meta.url)), true);
  assert.equal(existsSync(new URL('../src/assets/monogram.png', import.meta.url)), true);
  assert.equal(monogram[25], 6);
  assert.match(source, /import monogramImage from ['"]\.\/assets\/monogram\.png['"]/);
  assert.match(source, /className="welcome-monogram"/);
  assert.match(source, /alt="Kathreen and Lawrence monogram"/);
  assert.doesNotMatch(welcomeCard, /The wedding of/);
  assert.match(source, /In his light, we found each other\./);
  assert.match(styles, /url\(['"]\.\/assets\/landing-page\.jpg['"]\)/);
  assert.match(styles, /landing-page\.jpg['"]\) 0% 16% \/ 130% auto no-repeat/);
});
