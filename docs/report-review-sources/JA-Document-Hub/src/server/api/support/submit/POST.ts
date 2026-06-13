/**
 * POST /api/support/submit
 * Public endpoint — any visitor can submit a support ticket.
 * Optionally links to a logged-in user via session cookie.
 */
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../../db/client.js';
import { ja_support_tickets } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const { name, email, subject, message, category, priority } = req.body as {
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
    priority?: string;
  };

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, error: 'Name, email, subject, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const validCategories = ['general', 'billing', 'technical', 'templates', 'account', 'feedback', 'other'];
  const validPriorities = ['low', 'normal', 'high', 'urgent'];

  const safeCategory = validCategories.includes(category ?? '') ? (category as string) : 'general';
  const safePriority = validPriorities.includes(priority ?? '') ? (priority as 'low' | 'normal' | 'high' | 'urgent') : 'normal';

  try {
    // Try to link to logged-in user
    const userId = await resolveSession(req).catch(() => null);

    await db.insert(ja_support_tickets).values({
      uuid:     randomUUID(),
      userId:   userId ?? null,
      name:     name.trim().slice(0, 255),
      email:    email.trim().toLowerCase().slice(0, 255),
      subject:  subject.trim().slice(0, 500),
      message:  message.trim(),
      category: safeCategory,
      priority: safePriority,
      status:   'open',
    });

    return res.status(201).json({ success: true, message: 'Your support request has been submitted. We will be in touch shortly.' });
  } catch (err) {
    console.error('support.submit.error', err);
    return res.status(500).json({ success: false, error: 'Failed to submit your request. Please try again.' });
  }
}
