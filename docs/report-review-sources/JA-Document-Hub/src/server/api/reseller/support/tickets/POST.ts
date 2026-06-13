import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../../../db/client.js';
import { ja_resellers, ja_reseller_tickets, ja_reseller_ticket_messages } from '../../../../db/schema.js';
import { requireResellerSession } from '../../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;
    const { subject, body, priority } = req.body;
    if (!subject || !body) return res.status(400).json({ success: false, error: 'Subject and message are required.' });

    const uuid = randomUUID();
    const [result] = await db.insert(ja_reseller_tickets).values({
      uuid,
      resellerId: reseller.id,
      subject: subject.trim(),
      priority: priority ?? 'normal',
      status: 'open',
    });

    const ticketId = (result as { insertId: number }).insertId;
    await db.insert(ja_reseller_ticket_messages).values({
      ticketId,
      senderType: 'reseller',
      senderId: reseller.id,
      senderName: reseller.fullName,
      body: body.trim(),
    });

    return res.status(201).json({ success: true, uuid });
  });
}
