import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidMapEmbedUrl } from '../src/lib/maps.js';

test('accepts a Google Maps embed URL', () => {
  assert.equal(isValidMapEmbedUrl('https://www.google.com/maps/embed?pb=abc123'), true);
});

test('rejects unrelated or unsafe map URLs', () => {
  assert.equal(isValidMapEmbedUrl('https://example.com/maps/embed?pb=abc123'), false);
  assert.equal(isValidMapEmbedUrl('javascript:alert(1)'), false);
  assert.equal(isValidMapEmbedUrl('http://www.google.com/maps/embed?pb=abc123'), false);
});
