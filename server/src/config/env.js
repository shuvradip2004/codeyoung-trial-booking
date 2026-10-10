import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeyoung_trials',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  // business rules
  slotMinutes: 30,
  maxClassesPerMentorPerDay: 2,
  minLeadMinutes: 60, // can't book a class starting in less than 1 hour
  bookingWindowDays: 30,
  mentorWorkStart: process.env.MENTOR_WORK_START || '09:00',
  mentorWorkEnd: process.env.MENTOR_WORK_END || '23:00',

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Codeyoung Trials <no-reply@codeyoung.demo>',
  },
};
