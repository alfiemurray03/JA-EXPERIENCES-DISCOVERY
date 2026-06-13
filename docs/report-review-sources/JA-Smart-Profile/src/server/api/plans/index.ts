import { type Request, type Response } from 'express';
import db from '../../db.js';

export async function getPlans(_req: Request, res: Response) {
  try {
    const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY price_monthly ASC').all();
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
}
