import { type Request, type Response } from 'express';
import db from '../../db.js';
import { notifyUserPaused } from '../../lib/notifications.js';

// Users
export function getUsers(_req: Request, res: Response) {
  try {
    const users = db.prepare(`
      SELECT u.*, p.name as plan_name, 
        (SELECT COUNT(*) FROM profiles WHERE user_id = u.id) as profile_count
      FROM users u LEFT JOIN plans p ON u.plan_id = p.id ORDER BY u.created_at DESC
    `).all();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
}

export function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role, plan_id, name } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (plan_id !== undefined) { updates.push('plan_id = ?'); values.push(plan_id); }
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
    db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
    const user = db.prepare('SELECT id, email, name, role, plan_id, created_at FROM users WHERE id = ?').get(id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
}

export function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
}

// ── Pause / Unpause a single user ──────────────────────────────────────────
export function pauseUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { paused, reason } = req.body as { paused: boolean; reason?: string };
    db.prepare('UPDATE users SET is_paused = ?, pause_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(paused ? 1 : 0, reason ?? null, id);
    const user = db.prepare('SELECT id, email, name, is_paused, pause_reason FROM users WHERE id = ?').get(id) as {
      id: number; email: string; name: string; is_paused: number; pause_reason: string | null;
    } | undefined;
    if (user) notifyUserPaused({ userName: user.name, userEmail: user.email, userId: user.id, paused, reason });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update user pause state' });
  }
}

// ── Global plans pause (admin_settings key: plans_paused) ──────────────────
export function getGlobalPauseState(_req: Request, res: Response) {
  try {
    const row = db.prepare("SELECT value FROM admin_settings WHERE key = 'plans_paused'").get() as { value: string } | undefined;
    const msg = db.prepare("SELECT value FROM admin_settings WHERE key = 'plans_paused_message'").get() as { value: string } | undefined;
    res.json({
      success: true,
      paused: row?.value === '1',
      message: msg?.value ?? '',
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to get pause state' });
  }
}

export function setGlobalPauseState(req: Request, res: Response) {
  try {
    const { paused, message } = req.body as { paused: boolean; message?: string };
    const upsert = db.prepare('INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    upsert.run('plans_paused', paused ? '1' : '0');
    if (message !== undefined) upsert.run('plans_paused_message', message);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to set pause state' });
  }
}

// Profiles
export function getProfiles(_req: Request, res: Response) {
  try {
    const profiles = db.prepare(`
      SELECT p.*, u.email as user_email, u.name as user_name,
        (SELECT COUNT(*) FROM profile_links WHERE profile_id = p.id) as link_count,
        (SELECT COUNT(*) FROM page_views WHERE profile_id = p.id) as view_count
      FROM profiles p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC
    `).all();
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profiles' });
  }
}

export function deleteAdminProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete profile' });
  }
}

// Enquiries
export function getAllEnquiries(_req: Request, res: Response) {
  try {
    const enquiries = db.prepare(`
      SELECT ce.*, p.username, p.display_name as profile_name, u.email as user_email
      FROM contact_enquiries ce 
      JOIN profiles p ON ce.profile_id = p.id 
      JOIN users u ON p.user_id = u.id
      ORDER BY ce.created_at DESC
    `).all();
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
}

// Analytics
export function getAdminAnalytics(_req: Request, res: Response) {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    const totalProfiles = (db.prepare('SELECT COUNT(*) as c FROM profiles').get() as { c: number }).c;
    const totalEnquiries = (db.prepare('SELECT COUNT(*) as c FROM contact_enquiries').get() as { c: number }).c;
    const totalViews = (db.prepare('SELECT COUNT(*) as c FROM page_views').get() as { c: number }).c;
    const totalClicks = (db.prepare('SELECT COUNT(*) as c FROM link_clicks').get() as { c: number }).c;

    const recentUsers = db.prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10').all();
    const topProfiles = db.prepare(`
      SELECT p.username, p.display_name, COUNT(pv.id) as views
      FROM profiles p LEFT JOIN page_views pv ON p.id = pv.profile_id
      GROUP BY p.id ORDER BY views DESC LIMIT 10
    `).all();

    const viewsByDay = db.prepare(`
      SELECT DATE(viewed_at) as date, COUNT(*) as count 
      FROM page_views WHERE viewed_at >= datetime('now', '-30 days')
      GROUP BY DATE(viewed_at) ORDER BY date ASC
    `).all();

    res.json({ success: true, data: { totalUsers, totalProfiles, totalEnquiries, totalViews, totalClicks, recentUsers, topProfiles, viewsByDay } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
}

// Plans
export function getAdminPlans(_req: Request, res: Response) {
  try {
    const plans = db.prepare('SELECT * FROM plans ORDER BY price_monthly ASC').all();
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
}

export function createPlan(req: Request, res: Response) {
  try {
    const { name, slug, price_monthly, price_yearly, max_profiles, max_links,
      has_qr_download, has_contact_form, has_advanced_analytics, has_vcard_download,
      has_custom_themes, remove_branding, has_custom_domain } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, error: 'Name and slug required' });
    const result = db.prepare(`
      INSERT INTO plans (name, slug, price_monthly, price_yearly, max_profiles, max_links,
        has_qr_download, has_contact_form, has_advanced_analytics, has_vcard_download,
        has_custom_themes, remove_branding, has_custom_domain)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, price_monthly || 0, price_yearly || 0, max_profiles || 1, max_links || 5,
      has_qr_download || 0, has_contact_form || 0, has_advanced_analytics || 0, has_vcard_download || 0,
      has_custom_themes || 0, remove_branding || 0, has_custom_domain || 0);
    res.status(201).json({ success: true, data: db.prepare('SELECT * FROM plans WHERE id = ?').get(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
}

export function updatePlan(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const fields = ['name', 'price_monthly', 'price_yearly', 'max_profiles', 'max_links',
      'has_qr_download', 'has_contact_form', 'has_advanced_analytics', 'has_vcard_download',
      'has_custom_themes', 'remove_branding', 'has_custom_domain', 'is_active'];
    const updates = fields.filter(f => req.body[f] !== undefined);
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
    const setClause = updates.map(f => `${f} = ?`).join(', ');
    const values = updates.map(f => req.body[f]);
    db.prepare(`UPDATE plans SET ${setClause} WHERE id = ?`).run(...values, id);
    res.json({ success: true, data: db.prepare('SELECT * FROM plans WHERE id = ?').get(id) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update plan' });
  }
}

// Themes
export function getAdminThemes(_req: Request, res: Response) {
  try {
    const themes = db.prepare('SELECT * FROM themes ORDER BY id ASC').all();
    res.json({ success: true, data: themes });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch themes' });
  }
}

export function createTheme(req: Request, res: Response) {
  try {
    const { name, slug, description, primary_color, accent_color, background_color, text_color, is_free } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, error: 'Name and slug required' });
    const result = db.prepare(`
      INSERT INTO themes (name, slug, description, primary_color, accent_color, background_color, text_color, is_free)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, description || '', primary_color || '#3B82F6', accent_color || '#3B82F6',
      background_color || '#FFFFFF', text_color || '#0F172A', is_free !== undefined ? is_free : 1);
    res.status(201).json({ success: true, data: db.prepare('SELECT * FROM themes WHERE id = ?').get(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create theme' });
  }
}

export function updateTheme(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const fields = ['name', 'description', 'primary_color', 'accent_color', 'background_color', 'text_color', 'is_free', 'is_active'];
    const updates = fields.filter(f => req.body[f] !== undefined);
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });
    const setClause = updates.map(f => `${f} = ?`).join(', ');
    const values = updates.map(f => req.body[f]);
    db.prepare(`UPDATE themes SET ${setClause} WHERE id = ?`).run(...values, id);
    res.json({ success: true, data: db.prepare('SELECT * FROM themes WHERE id = ?').get(id) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update theme' });
  }
}

// Settings
export function getSettings(_req: Request, res: Response) {
  try {
    const settings = db.prepare('SELECT * FROM admin_settings').all() as { key: string; value: string }[];
    const obj: Record<string, string> = {};
    for (const s of settings) obj[s.key] = s.value;
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
}

export function updateSettings(req: Request, res: Response) {
  try {
    const update = db.prepare('INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    const updateMany = db.transaction((settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
        update.run(key, String(value));
      }
    });
    updateMany(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
}

// User settings update
export function updateUserSettings(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // IDOR guard — a customer can only update their own account.
    // req.session.userId is set by requireAuth middleware.
    const sessionUserId = (req as any).session?.userId;
    if (!sessionUserId || Number(id) !== Number(sessionUserId)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { name, email, current_password, new_password } = req.body;
    
    if (new_password) {
      const bcrypt = require('bcryptjs');
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id) as { password_hash: string } | undefined;
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      if (!bcrypt.compareSync(current_password, user.password_hash)) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }
      const hash = bcrypt.hashSync(new_password, 10);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, id);
    }
    
    if (name) db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, id);
    if (email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), id);
      if (existing) return res.status(409).json({ success: false, error: 'Email already in use' });
      db.prepare('UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(email.toLowerCase(), id);
    }
    
    const user = db.prepare('SELECT id, email, name, role, plan_id FROM users WHERE id = ?').get(id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
}

/**
 * UK GDPR Art 17 — Right to Erasure ("right to be forgotten").
 * Deletes all personal data associated with the account:
 * - User record (cascades to profiles, links, enquiries, subscriptions via FK)
 * - Explicit deletion of analytics rows (page_views, link_clicks) — no FK cascade
 * - Partner enquiries and support requests linked by email are anonymised
 * - A deletion record is kept for compliance audit (no PII, just timestamp + hashed ref)
 */
export function deleteAccount(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // IDOR guard — a customer can only delete their own account.
    const sessionUserId = (req as any).session?.userId;
    if (!sessionUserId || Number(id) !== Number(sessionUserId)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(id) as
      { id: number; email: string } | undefined;
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Collect profile IDs before deletion (needed for analytics cleanup)
    const profiles = db.prepare('SELECT id FROM profiles WHERE user_id = ?').all(id) as { id: number }[];
    const profileIds = profiles.map(p => p.id);

    db.transaction(() => {
      // Anonymise partner_enquiries and support_requests by email (not linked by FK)
      db.prepare(`UPDATE partner_enquiries SET name = '[deleted]', email = '[deleted]' WHERE email = ?`).run(user.email);
      db.prepare(`UPDATE support_requests SET name = '[deleted]', email = '[deleted]' WHERE email = ?`).run(user.email);

      // Delete analytics rows (no FK cascade on these)
      if (profileIds.length > 0) {
        const placeholders = profileIds.map(() => '?').join(',');
        db.prepare(`DELETE FROM page_views WHERE profile_id IN (${placeholders})`).run(...profileIds);
        db.prepare(`DELETE FROM link_clicks WHERE profile_id IN (${placeholders})`).run(...profileIds);
      }

      // Delete the user — FK ON DELETE CASCADE handles profiles, links, enquiries, subscriptions
      db.prepare('DELETE FROM users WHERE id = ?').run(id);

      // Record deletion for compliance audit (no PII stored — just a timestamp)
      try {
        db.prepare(`
          INSERT INTO data_deletion_requests (user_id, email, status, completed_at)
          VALUES (?, '[erased]', 'completed', CURRENT_TIMESTAMP)
        `).run(id, '[erased]');
      } catch { /* non-fatal */ }

      // Audit log
      try {
        db.prepare(`INSERT INTO audit_log (actor, action, detail) VALUES (?, 'account.deleted', ?)`)
          .run('system', `user_id=${id} — GDPR erasure completed`);
      } catch { /* non-fatal */ }
    })();

    res.json({ success: true });
  } catch (err) {
    console.error('[admin] deleteAccount error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
}

// ─── Branding ─────────────────────────────────────────────────────────────────

const BRANDING_KEYS = [
  'platform_name', 'platform_tagline', 'platform_description', 'platform_url',
  'master_brand_name', 'master_brand_url',
  'legal_company_name', 'legal_company_number', 'legal_registered_address',
  'legal_vat_number', 'legal_email', 'legal_privacy_email',
  'support_email', 'contact_email',
  'footer_tagline', 'footer_show_legal_name',
  'social_twitter', 'social_linkedin', 'social_instagram', 'social_facebook',
  'email_from_name',
];

export function getBranding(_req: Request, res: Response) {
  try {
    const rows = db.prepare('SELECT key, value FROM admin_settings').all() as { key: string; value: string }[];
    const obj: Record<string, string> = {};
    for (const r of rows) {
      if (BRANDING_KEYS.includes(r.key)) obj[r.key] = r.value;
    }
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch branding' });
  }
}

export function updateBranding(req: Request, res: Response) {
  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    const run = db.transaction((body: Record<string, string>) => {
      for (const key of BRANDING_KEYS) {
        if (key in body) upsert.run(key, String(body[key]));
      }
    });
    run(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update branding' });
  }
}

// ─── Partner Enquiries ────────────────────────────────────────────────────────

export function getPartnerEnquiries(_req: Request, res: Response) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS partner_enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT 'affiliate',
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        website TEXT,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const rows = db.prepare('SELECT * FROM partner_enquiries ORDER BY created_at DESC').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch partner enquiries' });
  }
}

export function markPartnerEnquiryRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    db.prepare('UPDATE partner_enquiries SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
}

export function deletePartnerEnquiry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM partner_enquiries WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete enquiry' });
  }
}

// Public branding endpoint (no auth required)
export function getPublicBranding(_req: Request, res: Response) {
  try {
    const rows = db.prepare('SELECT key, value FROM admin_settings').all() as { key: string; value: string }[];
    const obj: Record<string, string> = {};
    const publicKeys = ['platform_name', 'platform_tagline', 'platform_description', 'platform_url',
      'master_brand_name', 'master_brand_url', 'legal_company_name', 'legal_company_number',
      'footer_tagline', 'footer_show_legal_name', 'support_email', 'contact_email',
      'social_twitter', 'social_linkedin', 'social_instagram', 'social_facebook',
      // Theme keys are also public so the frontend can apply them on load
      'site_color_mode', 'site_primary_color', 'site_secondary_color', 'site_accent_color'];
    for (const r of rows) {
      if (publicKeys.includes(r.key)) obj[r.key] = r.value;
    }
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch branding' });
  }
}

// ─── Site Theme ───────────────────────────────────────────────────────────────

const THEME_KEYS = ['site_color_mode', 'site_primary_color', 'site_secondary_color', 'site_accent_color'];

export function getSiteTheme(_req: Request, res: Response) {
  try {
    const rows = db.prepare('SELECT key, value FROM admin_settings')
      .all() as { key: string; value: string }[];
    const obj: Record<string, string> = {};
    for (const r of rows) {
      if (THEME_KEYS.includes(r.key)) obj[r.key] = r.value;
    }
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch theme' });
  }
}

export function updateSiteTheme(req: Request, res: Response) {
  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    const run = db.transaction((body: Record<string, string>) => {
      for (const key of THEME_KEYS) {
        if (key in body) upsert.run(key, String(body[key]));
      }
    });
    run(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update theme' });
  }
}
