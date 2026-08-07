import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRsvp } from '../src/lib/rsvp.js';

test('accepts a numeric guest count when attending', () => {
  const result = validateRsvp({
    guestName: 'Maria Santos',
    attendance: 'attending',
    companionCount: '2',
  }, { maxCompanions: 5, deadline: '2026-09-30T23:59:59+08:00', now: '2026-08-01T00:00:00+08:00' });

  assert.equal(result.valid, true);
  assert.equal(result.data.companionCount, 2);
  assert.deepEqual(result.data, { guestName: 'Maria Santos', attendance: 'attending', companionCount: 2 });
});

test('rejects submissions after the RSVP deadline', () => {
  const result = validateRsvp({
    guestName: 'Maria Santos',
    attendance: 'declined',
    companionCount: '',
  }, { maxCompanions: 5, deadline: '2026-09-30T23:59:59+08:00', now: '2026-10-01T00:00:00+08:00' });

  assert.equal(result.valid, false);
  assert.equal(result.errors.form, 'RSVP submissions are closed.');
});

test('rejects more guests than the configured limit', () => {
  const result = validateRsvp({
    guestName: 'Maria Santos',
    attendance: 'attending',
    companionCount: 3,
  }, { maxCompanions: 2, deadline: '2026-09-30T23:59:59+08:00', now: '2026-08-01T00:00:00+08:00' });

  assert.equal(result.valid, false);
  assert.equal(result.errors.companionCount, 'You can include up to 2 guests.');
});

test('accepts an RSVP without a contact number', () => {
  const result = validateRsvp({
    guestName: '  Maria   Santos  ',
    attendance: 'declined',
    companionCount: '',
  }, { maxCompanions: 5, deadline: '2026-09-30T23:59:59+08:00', now: '2026-08-01T00:00:00+08:00' });

  assert.equal(result.valid, true);
  assert.deepEqual(result.data, { guestName: 'Maria Santos', attendance: 'declined', companionCount: 0 });
});
