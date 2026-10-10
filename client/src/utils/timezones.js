export const COMMON_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Kolkata',
];

export const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

export function allTimezones() {
  const list = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [...COMMON_ZONES];
  const b = browserTimezone();
  return list.includes(b) ? list : [b, ...list];
}

/** Today's date (YYYY-MM-DD) in the given timezone, plus optional day offset. */
export function dateInZone(tz, addDays = 0) {
  const d = new Date(Date.now() + addDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);
}
