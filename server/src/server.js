import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import Booking from './models/Booking.js';

async function start() {
  await connectDB();
  await Booking.init(); // make sure the unique index exists
  app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
