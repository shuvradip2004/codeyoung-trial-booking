import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Mentor from '../models/Mentor.js';

const names = [
  'Aarav Sharma', 'Priya Das', 'Rohan Gupta', 'Ananya Roy', 'Vikram Singh',
  'Sneha Banerjee', 'Arjun Mehta', 'Ishita Ghosh', 'Kunal Verma', 'Meera Iyer',
];

async function seed() {
  await connectDB();
  for (let i = 0; i < names.length; i++) {
    await Mentor.updateOne(
      { email: `mentor${i + 1}@codeyoung.demo` },
      { $set: { name: names[i], timezone: 'Asia/Kolkata', active: true } },
      { upsert: true }
    );
  }
  console.log(`Seeded ${names.length} mentors (Asia/Kolkata).`);
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
