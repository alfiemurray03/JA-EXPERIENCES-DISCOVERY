import { type Request, type Response } from 'express';
import db from '../../db.js';

export async function getThemes(_req: Request, res: Response) {
  try {
    const themes = db.prepare(`
      SELECT id, name, slug, description, primary_color, accent_color, background_color, text_color,
        is_free, category, font_heading, font_body, card_style, gradient, border_radius, button_style, layout, sort_order
      FROM themes WHERE is_active = 1 ORDER BY sort_order ASC, id ASC
    `).all();
    res.json({ success: true, data: themes });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch themes' });
  }
}
