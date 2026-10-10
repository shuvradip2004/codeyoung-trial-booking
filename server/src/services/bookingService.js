import crypto from 'crypto';
import { DateTime } from 'luxon';
import Booking from '../models/Booking.js';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { isValidZone, describeInZone } from '../utils/time.js';
import { getAvailableMentors, loadContext } from './availabilityService.js';
import { sendBookingEmails } from './emailService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const noMentorError = () =>
  new AppError(
    409,
    'NO_MENTOR_AVAILABLE',
    'Sorry, no mentor is available for this time slot anymore. Please choose another slot or date.'
  );

async function mentorDayCount(mentor, start) {
  const dayStart = DateTime.fromJSDate(start, { zone: mentor.timezone }).startOf('day');
  return Booking.countDocuments({
    mentor: mentor._id,
    status: 'confirmed',
    startUtc: { $gte: dayStart.toJSDate(), $lt: dayStart.plus({ days: 1 }).toJSDate() },
  });
}

export async function createBooking({ parentName, parentEmail, startUtc, timezone } = {}) {
  // ---- validation ----
  if (!parentName || !parentName.trim()) throw new AppError(400, 'VALIDATION', 'Name is required.');
  if (!EMAIL_RE.test(parentEmail || '')) throw new AppError(400, 'VALIDATION', 'A valid email is required.');
  if (!isValidZone(timezone)) throw new AppError(400, 'VALIDATION', 'Invalid timezone.');

  const start = new Date(startUtc);
  if (Number.isNaN(start.getTime())) throw new AppError(400, 'VALIDATION', 'Invalid slot time.');

  const local = DateTime.fromJSDate(start, { zone: timezone });
  if (local.second !== 0 || local.minute % env.slotMinutes !== 0) {
    throw new AppError(400, 'VALIDATION', 'Slot time is not valid.');
  }
  const now = Date.now();
  if (start.getTime() < now + env.minLeadMinutes * 60000) {
    throw new AppError(400, 'SLOT_IN_PAST', 'This slot is too soon or already passed. Please pick a later slot.');
  }
  if (start.getTime() > now + env.bookingWindowDays * 86400000) {
    throw new AppError(400, 'SLOT_TOO_FAR', `You can book up to ${env.bookingWindowDays} days ahead.`);
  }

  // ---- find a mentor ----
  const end = new Date(start.getTime() + env.slotMinutes * 60000);
  const { mentors, bookings } = await loadContext(start, end);
  const candidates = getAvailableMentors(start, mentors, bookings);
  if (candidates.length === 0) throw noMentorError();

  for (const mentor of candidates) {
    let booking;
    try {
      booking = await Booking.create({
        mentor: mentor._id,
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim(),
        parentTimezone: timezone,
        startUtc: start,
        endUtc: end,
        meetingLink: `https://class.codeyoung.demo/trial/${crypto.randomUUID()}`,
      });
    } catch (err) {
      if (err.code === 11000) continue; // someone just took this mentor for this slot -> try next
      throw err;
    }

    // Re-check the 2-per-day limit after insert (protects against concurrent requests)
    if ((await mentorDayCount(mentor, start)) > env.maxClassesPerMentorPerDay) {
      await Booking.deleteOne({ _id: booking._id });
      continue;
    }

    const parentLocal = describeInZone(start, timezone);
    const mentorLocal = describeInZone(start, mentor.timezone);

    // email failure must not undo a confirmed booking
    sendBookingEmails({ booking, mentor, parentLocal, mentorLocal }).catch((e) =>
      console.error('Email failed:', e.message)
    );

    return {
      id: booking._id,
      startUtc: start.toISOString(),
      meetingLink: booking.meetingLink,
      parent: { name: booking.parentName, email: booking.parentEmail, local: parentLocal },
      mentor: { name: mentor.name, local: mentorLocal },
    };
  }

  throw noMentorError();
}
