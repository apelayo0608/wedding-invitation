import test from 'node:test';
import assert from 'node:assert/strict';
import { playMusicThenOpen, startInvitationMusic } from '../src/lib/music.js';

test('starts music when the invitation is opened', async () => {
  let played = false;
  const audio = { src: 'https://example.test/music.mp3', muted: true, play: async () => { played = true; } };
  assert.equal(await startInvitationMusic(audio), true);
  assert.equal(played, true);
  assert.equal(audio.muted, false);
});

test('keeps the invitation usable when music cannot start', async () => {
  const audio = { src: 'https://example.test/music.mp3', play: async () => { throw new Error('blocked'); } };
  assert.equal(await startInvitationMusic(audio), false);
});

test('requests music playback before opening the invitation', async () => {
  const order = [];
  const audio = { src: 'https://example.test/music.mp3', play: async () => { order.push('play'); } };

  await playMusicThenOpen(audio, () => order.push('open'));

  assert.deepEqual(order, ['play', 'open']);
});
