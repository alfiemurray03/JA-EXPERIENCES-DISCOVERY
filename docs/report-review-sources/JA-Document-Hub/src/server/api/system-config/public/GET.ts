/**
 * GET /api/system-config/public
 * Returns only safe public-facing feature toggles + accessibility settings.
 * No auth required — called at app startup by FeatureConfigProvider.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';

export default async function handler(_req: Request, res: Response) {
  try {
    const rows = await db.select().from(ja_system_config);
    const all: Record<string, string> = {};
    for (const row of rows) all[row.configKey] = row.value;

    const config: Record<string, unknown> = {
      registration:    all['toggle_registration']    !== 'false',
      free_plan:       all['toggle_free_plan']        !== 'false',
      pdf_export:      all['toggle_pdf_export']       !== 'false',
      word_export:     all['toggle_word_export']      !== 'false',
      new_templates:   all['toggle_new_templates']    !== 'false',
      usage_analytics: all['toggle_usage_analytics']  !== 'false',
      maintenance:     all['toggle_maintenance']      === 'true',
      // Payments: default OFF until explicitly enabled by admin
      payments:        all['toggle_payments']         === 'true',

      // Accessibility bubble
      a11y_enabled:          all['a11y_enabled']          !== 'false',
      a11y_position:         all['a11y_position']         ?? 'bottom-right',
      a11y_feat_font_size:   all['a11y_feat_font_size']   !== 'false',
      a11y_feat_contrast:    all['a11y_feat_contrast']    !== 'false',
      a11y_feat_motion:      all['a11y_feat_motion']      !== 'false',
      a11y_feat_dyslexia:    all['a11y_feat_dyslexia']    !== 'false',
      a11y_feat_links:       all['a11y_feat_links']       !== 'false',
      a11y_feat_grayscale:   all['a11y_feat_grayscale']   !== 'false',
    };

    return res.json({ success: true, config });
  } catch (err) {
    console.error('system-config.public.get.error', err);
    return res.json({
      success: true,
      config: {
        registration: true,
        free_plan: true,
        pdf_export: true,
        word_export: true,
        new_templates: true,
        usage_analytics: true,
        maintenance: false,
        a11y_enabled: true,
        a11y_position: 'bottom-right',
        a11y_feat_font_size: true,
        a11y_feat_contrast: true,
        a11y_feat_motion: true,
        a11y_feat_dyslexia: true,
        a11y_feat_links: true,
        a11y_feat_grayscale: true,
        payments: false,
      },
    });
  }
}
