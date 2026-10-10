import { getSlotsForDate } from '../services/availabilityService.js';
import { isValidZone } from '../utils/time.js';
import AppError from '../utils/AppError.js';

export async function getSlots(req, res, next) {
  try {
    const { date, tz } = req.query;
    if (!isValidZone(tz)) throw new AppError(400, 'VALIDATION', 'Invalid or missing timezone (tz).');
    const slots = await getSlotsForDate(date, tz);
    res.json({ date, timezone: tz, slots });
  } catch (err) {
    next(err);
  }
}
