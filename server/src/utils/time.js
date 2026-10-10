import { DateTime } from 'luxon';

export const isValidZone = (tz) => typeof tz === 'string' && DateTime.now().setZone(tz).isValid;

export const hhmmToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Describe a UTC instant in a given IANA timezone.
 * Luxon uses the IANA tz database, so DST (EST/EDT, GMT/BST, ...) is handled for the
 * specific date automatically.
 */
export function describeInZone(date, zone) {
  const dt = DateTime.fromJSDate(date, { zone });
  let abbr = dt.toFormat('ZZZZ');
  if (zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta') abbr = 'IST';
  else if (zone === 'Europe/London') abbr = dt.isInDST ? 'BST' : 'GMT';
  else if (/^(GMT|UTC)/.test(abbr)) abbr = '';

  const offset = `UTC${dt.toFormat('ZZ')}`;
  const tzLabel = abbr ? `${abbr} (${offset})` : offset;
  const time = dt.toFormat('hh:mm a');
  const day = dt.toFormat('cccc, dd LLL yyyy');
  return { time, date: day, tzLabel, timezone: zone, full: `${day}, ${time} ${tzLabel}` };
}
