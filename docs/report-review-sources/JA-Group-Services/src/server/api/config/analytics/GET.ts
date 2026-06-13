import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  try {
    const gaId = getSecret('GOOGLE_ANALYTICS_ID');
    
    if (!gaId) {
      return res.json({ gaId: null });
    }

    res.json({ gaId });
  } catch (error) {
    console.error('Error fetching analytics config:', error);
    res.status(500).json({ error: 'Failed to fetch analytics configuration' });
  }
}
