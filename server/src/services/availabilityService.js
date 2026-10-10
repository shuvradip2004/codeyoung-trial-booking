import { DateTime } from 'luxon';
import Mentor from '../models/Mentor.js';
import Booking from '../models/Booking.js';
import { env } from '../config/env.js';
import { hhmmToMinutes } from '../utils/time.js';
import { describeInZone } from '../utils/time.js';
import AppError from '../utils/AppError.js';

const SLOT_MS = env.slotMinutes * 60 * 1000;

const localDay = (date, tz) => DateTime.fromJSDate(date, { zone: tz }).toISODate();

/** Is the slot inside the mentor's working hours (measured in the MENTOR's local time)? */
function withinWorkHours(start, mentor) {
  const local = DateTime.fromJSDate(start, { zone: mentor.timezone });
  const startMin = local.hour * 60 + local.minute;
  return (
    startMin >= hhmmToMinutes(env.mentorWorkStart) &&
    startMin + env.slotMinutes <= hhmmToMinutes(env.mentorWorkEnd)
  );
}

/**
 * Pure function: which mentors can take a class starting at `start`?
 * Rules: working hours, no overlapping class, max 2 classes per mentor per (mentor-local) day.
 * Returned list is ordered by lowest load first so classes spread evenly across mentors.
 */
export function getAvailableMentors(start, mentors, bookings) {
  const s = start.getTime();
  const e = s + SLOT_MS;
  const candidates = [];

  for (const mentor of mentors) {
    if (!withinWorkHours(start, mentor)) continue;

    const mine = bookings.filter((b) => String(b.mentor) === String(mentor._id));
    const overlaps = mine.some((b) => b.startUtc.getTime() < e && b.startUtc.getTime() + SLOT_MS > s);
    if (overlaps) continue;

    const day = localDay(start, mentor.timezone);
    const load = mine.filter((b) => localDay(b.startUtc, mentor.timezone) === day).length;
    if (load >= env.maxClassesPerMentorPerDay) continue;

    candidates.push({ mentor, load, rnd: Math.random() });
  }

  return candidates.sort((a, b) => a.load - b.load || a.rnd - b.rnd).map((c) => c.mentor);
}

/** Load active mentors + confirmed bookings in a UTC window (padded so mentor-local days are covered). */
export async function loadContext(fromUtc, toUtc) {
  const pad = 24 * 60 * 60 * 1000;
  const [mentors, bookings] = await Promise.all([
    Mentor.find({ active: true }),
    Booking.find({
      status: 'confirmed',
      startUtc: { $gte: new Date(fromUtc.getTime() - pad), $lt: new Date(toUtc.getTime() + pad) },
    }),
  ]);
  return { mentors, bookings };
}

/** All bookable slots for a calendar date as seen by the parent in their own timezone. */
export async function getSlotsForDate(dateStr, timezone) {
  const dayStart = DateTime.fromISO(dateStr || '', { zone: timezone }).startOf('day');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '') || !dayStart.isValid) {
    throw new AppError(400, 'INVALID_DATE', 'Please provide a valid date (YYYY-MM-DD).');
  }
  // plus({days:1}) is calendar-aware, so a DST day correctly has 23 or 25 hours
  const dayEnd = dayStart.plus({ days: 1 });
  const { mentors, bookings } = await loadContext(dayStart.toJSDate(), dayEnd.toJSDate());

  const now = Date.now();
  const earliest = now + env.minLeadMinutes * 60 * 1000;
  const latest = now + env.bookingWindowDays * 24 * 60 * 60 * 1000;

  const slots = [];
  for (let t = dayStart; t < dayEnd; t = t.plus({ minutes: env.slotMinutes })) {
    const start = t.toJSDate();
    if (start.getTime() < earliest || start.getTime() > latest) continue;
    if (getAvailableMentors(start, mentors, bookings).length === 0) continue;
    const d = describeInZone(start, timezone);
    slots.push({ startUtc: start.toISOString(), time: d.time, tzLabel: d.tzLabel });
  }
  return slots;
}
