import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    timezone: { type: String, default: 'Asia/Kolkata' }, // IANA zone
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Mentor', mentorSchema);
