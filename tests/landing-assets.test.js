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
  assert.match(source, /className={`welcome-envelope \$\{opening \? 'is-opening' : ''\}`}/);
  assert.match(source, /className="envelope-flap"/);
  assert.match(source, /disabled=\{opening\}/);
  assert.match(source, /startInvitationMusic\(musicRef\.current\)/);
  assert.match(source, /setOpened\(true\), reduce \? 0 : ENVELOPE_OPEN_DURATION/);
  assert.doesNotMatch(welcomeCard, /The wedding of/);
  assert.match(source, /In his light, we found each other\./);
  assert.match(styles, /url\(['"]\.\/assets\/landing-page\.jpg['"]\)/);
  assert.match(styles, /landing-page\.jpg['"]\) 0% 16% \/ 130% auto no-repeat/);
  assert.match(styles, /width: min\(310px, calc\(100% - 32px\)\)/);
  assert.match(styles, /\.welcome-monogram \{ position: absolute;[^}]*top: -58px;[^}]*left: 50%/);
  assert.match(styles, /\.welcome-envelope\.is-opening \.envelope-flap/);
  assert.match(styles, /\.welcome-envelope\.is-opening \.welcome-card/);
  assert.match(styles, /\.envelope-flap \{ position: absolute; z-index: 2;/);
  assert.match(styles, /\.welcome-envelope-body \{[^}]*background: rgba\(245, 236, 228, \.78\)/);
  assert.match(styles, /\.envelope-flap \{[^}]*background: rgba\(248, 240, 233, \.7\)/);
});
