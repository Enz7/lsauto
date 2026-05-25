import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

let mailer: ReturnType<typeof nodemailer.createTransport> | null = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!mailer) return;
  try {
    await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
    logger.debug({ to, subject }, 'email sent');
  } catch (err: unknown) {
    logger.warn({ err: (err as Error).message, to }, 'email failed');
  }
};
