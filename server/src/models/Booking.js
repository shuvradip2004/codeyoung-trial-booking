import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    parentName: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, lowercase: true, trim: true },
    parentTimezone: { type: String, required: true }, // IANA zone
    startUtc: { type: Date, required: true }, // ALWAYS stored in UTC
    endUtc: { type: Date, required: true },
    meetingLink: { type: String, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

// A mentor can never be double-booked for the same start time (guards against race conditions)
bookingSchema.index(
  { mentor: 1, startUtc: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);
bookingSchema.index({ startUtc: 1 });

export default mongoose.model('Booking', bookingSchema);
