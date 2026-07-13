import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('forwards anchor IDs to rendered invitation sections', () => {
  const source = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  assert.match(source, /function Section\(\{ children, className = '', delay = 0, \.\.\.sectionProps \}\)/);
  assert.match(source, /<motion\.section \{\.\.\.sectionProps\} className=/);
});

test('offsets section anchors below the fixed navigation', () => {
  const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.section\[id\]\s*\{\s*scroll-margin-top:\s*94px;/);
});
