export function validateRsvp(input, options = {}) {
  const errors = {};
  const maxCompanions = Number.isInteger(options.maxCompanions) ? options.maxCompanions : 5;
  const now = new Date(options.now || Date.now());
  const deadline = options.deadline ? new Date(options.deadline) : null;
  const guestName = String(input?.guestName || '').trim().replace(/\s+/g, ' ');
  const attendance = input?.attendance;
  const legacyCompanions = Array.isArray(input?.companions) ? input.companions : null;
  const rawCompanionCount = input?.companionCount ?? (legacyCompanions ? legacyCompanions.length : input?.companions ?? 0);
  const companionCount = rawCompanionCount === '' ? 0 : Number(rawCompanionCount);

  if (guestName.length < 2) errors.guestName = 'Please enter your name.';
  if (guestName.length > 180) errors.guestName = 'Please enter a shorter name.';
  if (!['attending', 'declined'].includes(attendance)) errors.attendance = 'Please confirm your attendance.';
  if (deadline && !Number.isNaN(deadline.valueOf()) && now > deadline) errors.form = 'RSVP submissions are closed.';

  if (!Number.isInteger(companionCount) || companionCount < 0) {
    errors.companionCount = 'Enter a valid number of guests.';
  } else if (attendance === 'declined' && companionCount) {
    errors.companionCount = 'Guest count is only needed for attending guests.';
  } else if (attendance === 'attending' && companionCount > maxCompanions) {
    errors.companionCount = `You can include up to ${maxCompanions} guests.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { guestName, attendance, companionCount: attendance === 'attending' ? companionCount : 0 },
  };
}
