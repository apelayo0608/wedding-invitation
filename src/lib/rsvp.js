export function validateRsvp(input, options = {}) {
  const errors = {};
  const maxCompanions = Number.isInteger(options.maxCompanions) ? options.maxCompanions : 5;
  const now = new Date(options.now || Date.now());
  const deadline = options.deadline ? new Date(options.deadline) : null;
  const guestName = String(input?.guestName || '').trim().replace(/\s+/g, ' ');
  const attendance = input?.attendance;
  const hasCompanionList = Array.isArray(input?.companions);
  const companions = hasCompanionList
    ? input.companions.map((name) => String(name || '').trim().replace(/\s+/g, ' '))
    : [];
  const rawCompanionCount = input?.companionCount ?? (hasCompanionList ? companions.length : input?.companions ?? 0);
  const companionCount = rawCompanionCount === '' ? 0 : Number(rawCompanionCount);

  if (guestName.length < 2) errors.guestName = 'Please enter your name.';
  if (guestName.length > 180) errors.guestName = 'Please enter a shorter name.';
  if (!['attending', 'declined'].includes(attendance)) errors.attendance = 'Please confirm your attendance.';
  if (deadline && !Number.isNaN(deadline.valueOf()) && now > deadline) errors.form = 'RSVP submissions are closed.';

  if (hasCompanionList) {
    if (attendance === 'declined' && companions.length) {
      errors.companions = 'Companions are only needed for attending guests.';
    } else if (attendance === 'attending') {
      if (companions.length > maxCompanions) errors.companions = `You can add up to ${maxCompanions} companions.`;
      if (companions.some((name) => !name)) errors.companions = 'Enter a name for every companion.';
      const normalized = companions.map((name) => name.toLocaleLowerCase());
      if (new Set(normalized).size !== normalized.length) errors.companions = 'Each companion name should be unique.';
    }
  } else if (!Number.isInteger(companionCount) || companionCount < 0) {
    errors.companionCount = 'Enter a valid number of guests.';
  } else if (attendance === 'declined' && companionCount) {
    errors.companionCount = 'Guest count is only needed for attending guests.';
  } else if (attendance === 'attending' && companionCount > maxCompanions) {
    errors.companionCount = `You can include up to ${maxCompanions} guests.`;
  }

  const data = {
    guestName,
    attendance,
    companionCount: attendance === 'attending' ? (hasCompanionList ? companions.length : companionCount) : 0,
  };
  if (hasCompanionList) data.companions = attendance === 'attending' ? companions : [];

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}
