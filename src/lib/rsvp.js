export function normalizeContact(value = '') {
  const digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('0')) return `63${digits.slice(1)}`;
  return digits;
}

export function validateRsvp(input, options = {}) {
  const errors = {};
  const maxCompanions = Number.isInteger(options.maxCompanions) ? options.maxCompanions : 5;
  const now = new Date(options.now || Date.now());
  const deadline = options.deadline ? new Date(options.deadline) : null;
  const guestName = String(input?.guestName || '').trim();
  const contact = normalizeContact(input?.contactNumber);
  const attendance = input?.attendance;
  const companions = Array.isArray(input?.companions) ? input.companions.map((name) => String(name).trim()) : [];

  if (guestName.length < 2) errors.guestName = 'Please enter your name.';
  if (contact.length < 10 || contact.length > 15) errors.contactNumber = 'Please enter a valid contact number.';
  if (!['attending', 'declined'].includes(attendance)) errors.attendance = 'Please confirm your attendance.';
  if (deadline && !Number.isNaN(deadline.valueOf()) && now > deadline) errors.form = 'RSVP submissions are closed.';

  if (attendance === 'declined' && companions.length) {
    errors.companions = 'Companions are only needed for attending guests.';
  } else if (attendance === 'attending') {
    if (companions.length > maxCompanions) errors.companions = `You can add up to ${maxCompanions} companions.`;
    if (companions.some((name) => !name)) errors.companions = 'Enter a name for every companion.';
    const normalized = companions.map((name) => name.toLowerCase());
    if (new Set(normalized).size !== normalized.length) errors.companions = 'Each companion name should be unique.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { guestName, contactNumber: contact, attendance, companions: attendance === 'attending' ? companions : [] },
  };
}
