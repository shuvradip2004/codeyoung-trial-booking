import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const useSmtp = Boolean(env.smtp.host);
const transporter = useSmtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

async function send({ to, subject, text }) {
  const info = await transporter.sendMail({ from: env.smtp.from, to, subject, text });
  if (!useSmtp) {
    console.log(`\n=== DUMMY EMAIL ===\nTo: ${to}\nSubject: ${subject}\n\n${text}\n===================\n`);
  } else {
    console.log('Email sent:', info.messageId);
  }
}

export async function sendBookingEmails({ booking, mentor, parentLocal, mentorLocal }) {
  const parentText = `Hi ${booking.parentName},

Your free trial class is confirmed!

Mentor : ${mentor.name}
When   : ${parentLocal.full}   (your local time)
Join   : ${booking.meetingLink}

See you in class!
- Team Codeyoung`;

  const mentorText = `Hi ${mentor.name},

A new trial class has been assigned to you.

Student's parent : ${booking.parentName} (${booking.parentEmail})
When             : ${mentorLocal.full}   (your local time)
Join             : ${booking.meetingLink}

- Team Codeyoung`;

  await Promise.all([
    send({ to: booking.parentEmail, subject: `Trial class confirmed - ${parentLocal.date}, ${parentLocal.time}`, text: parentText }),
    send({ to: mentor.email, subject: `New trial class - ${mentorLocal.date}, ${mentorLocal.time}`, text: mentorText }),
  ]);
}
