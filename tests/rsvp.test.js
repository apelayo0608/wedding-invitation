import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeContact, validateRsvp } from '../src/lib/rsvp.js';

test('normalizes a Philippine mobile number to digits with country code', () => {
  assert.equal(normalizeContact('+63 917 368 6440'), '639173686440');
  assert.equal(normalizeContact('0917-368-6440'), '639173686440');
});

test('requires companion names when attending', () => {
  const result = validateRsvp({
    guestName: 'Maria Santos',
    contactNumber: '09173686440',
    attendance: 'attending',
    companions: [''],
  }, { maxCompanions: 5, deadline: '2026-09-30T23:59:59+08:00', now: '2026-08-01T00:00:00+08:00' });

  assert.equal(result.valid, false);
  assert.equal(result.errors.companions, 'Enter a name for every companion.');
});

test('rejects submissions after the RSVP deadline', () => {
  const result = validateRsvp({
    guestName: 'Maria Santos',
    contactNumber: '09173686440',
    attendance: 'declined',
    companions: [],
  }, { maxCompanions: 5, deadline: '2026-09-30T23:59:59+08:00', now: '2026-10-01T00:00:00+08:00' });

  assert.equal(result.valid, false);
  assert.equal(result.errors.form, 'RSVP submissions are closed.');
});

test('rejects more companions than the configured limit', () => {
  const result = validateRsvp({
    guestName: 'Maria Santos',
    contactNumber: '09173686440',
    attendance: 'attending',
    companions: ['Ana', 'Ben', 'Cleo'],
  }, { maxCompanions: 2, deadline: '2026-09-30T23:59:59+08:00', now: '2026-08-01T00:00:00+08:00' });

  assert.equal(result.valid, false);
  assert.equal(result.errors.companions, 'You can add up to 2 companions.');
});
