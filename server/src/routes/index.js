import { Router } from 'express';
import { getSlots } from '../controllers/slotController.js';
import { postBooking } from '../controllers/bookingController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.get('/slots', getSlots);
router.post('/bookings', postBooking);

export default router;
