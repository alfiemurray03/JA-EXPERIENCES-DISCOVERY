import { type Request, type Response } from 'express';
import db from '../../db.js';
import { type AuthRequest } from '../../middleware/auth.js';

// ─── helpers ──────────────────────────────────────────────────────────────

/** Map plan slug → URL prefix letter */
const PLAN_PREFIX: Record<string, string> = {
  free: 'F',
  starter: 'S',
  professional: 'P',
  business: 'B', // business plan users still get personal prefix B
};

/** Slugify a string for use in URLs */
export function slugify(str: string): string {
  return str.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/profiles/me
export async function getMyProfiles(req: AuthRequest, res: Response) {
  try {
    // COALESCE ensures messaging_enabled / enquiry_enabled are never NULL for
    // rows created before the columns were added (ALTER TABLE sets NULL for
    // existing rows even when DEFAULT is specified).
    const profiles = db.prepare(`
      SELECT *,
             COALESCE(messaging_enabled, 1) AS messaging_enabled,
             COALESCE(enquiry_enabled,   1) AS enquiry_enabled
      FROM profiles
      WHERE user_id = ?
      ORDER BY created_at ASC
    `).all(req.user!.id);
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profiles' });
  }
}

// POST /api/profiles
export async function createProfile(req: AuthRequest, res: Response) {
  try {
    const { username, display_name, profile_type } = req.body;

    // ── Business profile creation ──────────────────────────────────────────
    if (profile_type === 'business') {
      const {
        business_name, person_name, business_description, business_category,
        services, team_members, opening_hours, logo_url, cover_url,
      } = req.body;

      if (!business_name || !person_name) {
        return res.status(400).json({ success: false, error: 'Business name and person name are required' });
      }

      const bizSlug = slugify(business_name);
      const personSlug = slugify(person_name);

      if (!bizSlug || !personSlug) {
        return res.status(400).json({ success: false, error: 'Could not generate valid URL slugs from the provided names' });
      }

      // Check plan limits
      const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.user!.plan_id) as { max_profiles: number; slug: string } | undefined;
      const profileCount = (db.prepare('SELECT COUNT(*) as c FROM profiles WHERE user_id = ?').get(req.user!.id) as { c: number }).c;
      if (plan && profileCount >= plan.max_profiles) {
        return res.status(403).json({ success: false, error: `Your plan allows a maximum of ${plan.max_profiles} profile(s). Upgrade to create more.` });
      }

      const existing = db.prepare('SELECT id FROM profiles WHERE biz_slug = ? AND person_slug = ?').get(bizSlug, personSlug);
      if (existing) return res.status(409).json({ success: false, error: 'A business profile with this URL already exists' });

      // Generate a unique internal username for the profile
      const internalUsername = `${bizSlug}--${personSlug}`;
      const existingUsername = db.prepare('SELECT id FROM profiles WHERE username = ?').get(internalUsername);
      if (existingUsername) return res.status(409).json({ success: false, error: 'A business profile with this URL already exists' });

      const result = db.prepare(`
        INSERT INTO profiles (user_id, username, display_name, profile_type, url_prefix, biz_slug, person_slug,
          business_name, business_description, business_category, services, team_members, opening_hours, logo_url, cover_url)
        VALUES (?, ?, ?, 'business', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user!.id, internalUsername, person_name, bizSlug,
        bizSlug, personSlug, business_name,
        business_description || '', business_category || '',
        services ? JSON.stringify(services) : null,
        team_members ? JSON.stringify(team_members) : null,
        opening_hours || null, logo_url || null, cover_url || null,
      );

      const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json({ success: true, data: profile, url: `/${bizSlug}/${personSlug}` });
    }

    // ── Personal profile creation (Free / Starter / Professional) ─────────
    if (!username) return res.status(400).json({ success: false, error: 'Username is required' });
    if (!/^[a-z0-9-]{3,30}$/.test(username)) {
      return res.status(400).json({ success: false, error: 'Username must be 3-30 characters, lowercase letters, numbers, and hyphens only' });
    }

    // Check plan limits
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.user!.plan_id) as { max_profiles: number; slug: string } | undefined;
    const profileCount = (db.prepare('SELECT COUNT(*) as c FROM profiles WHERE user_id = ?').get(req.user!.id) as { c: number }).c;
    if (plan && profileCount >= plan.max_profiles) {
      return res.status(403).json({ success: false, error: `Your plan allows a maximum of ${plan.max_profiles} profile(s). Upgrade to create more.` });
    }

    const existing = db.prepare('SELECT id FROM profiles WHERE username = ?').get(username);
    if (existing) return res.status(409).json({ success: false, error: 'This username is already taken' });

    // Determine prefix from plan slug
    const prefix = PLAN_PREFIX[plan?.slug ?? 'free'] ?? 'F';

    const result = db.prepare(
      'INSERT INTO profiles (user_id, username, display_name, profile_type, url_prefix) VALUES (?, ?, ?, \'personal\', ?)'
    ).run(req.user!.id, username, display_name || '', prefix);

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: profile, url: `/${prefix}/${username}` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create profile' });
  }
}

// PUT /api/profiles/:id
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?').get(id, req.user!.id);
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const fields = ['display_name', 'job_title', 'company', 'bio', 'phone', 'email', 'website', 'address',
      'profile_photo', 'is_published', 'show_phone', 'show_email', 'show_website', 'show_address', 'show_bio', 'theme_id'];
    
    // Handle username change
    if (req.body.username) {
      const { username } = req.body;
      if (!/^[a-z0-9-]{3,30}$/.test(username)) {
        return res.status(400).json({ success: false, error: 'Invalid username format' });
      }
      const existing = db.prepare('SELECT id FROM profiles WHERE username = ? AND id != ?').get(username, id);
      if (existing) return res.status(409).json({ success: false, error: 'Username already taken' });
      fields.push('username');
    }

    const updates = fields.filter(f => req.body[f] !== undefined);
    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update' });

    const setClause = updates.map(f => `${f} = ?`).join(', ');
    const values = updates.map(f => req.body[f]);
    db.prepare(`UPDATE profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);

    const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}

// DELETE /api/profiles/:id
export async function deleteProfile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?').get(id, req.user!.id);
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete profile' });
  }
}

// GET /api/profiles/:username/public
// GET /api/profiles/:prefix/:username/public  — personal profiles (F/S/P/B + username)
// GET /api/profiles/public?prefix=X&username=Y  — same via query (fallback)
export async function getPublicProfile(req: Request, res: Response) {
  try {
    const { prefix, username } = req.params as { prefix: string; username: string };

    const PERSONAL_PREFIXES = ['F', 'S', 'P', 'B'];

    if (!PERSONAL_PREFIXES.includes(prefix.toUpperCase())) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = db.prepare(
      'SELECT * FROM profiles WHERE username = ? AND url_prefix = ? AND is_published = 1 AND profile_type = \'personal\''
    ).get(username, prefix.toUpperCase()) as Record<string, unknown> | undefined;

    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    return buildPublicProfileResponse(profile, res);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
}

// GET /api/business/:bizSlug/:personSlug/public  — business profiles
export async function getPublicBusinessProfile(req: Request, res: Response) {
  try {
    const { bizSlug, personSlug } = req.params;

    const profile = db.prepare(
      'SELECT * FROM profiles WHERE biz_slug = ? AND person_slug = ? AND is_published = 1 AND profile_type = \'business\''
    ).get(bizSlug, personSlug) as Record<string, unknown> | undefined;

    if (!profile) return res.status(404).json({ success: false, error: 'Business profile not found' });

    const user = db.prepare('SELECT plan_id FROM users WHERE id = ?').get(profile.user_id as number) as { plan_id: number } | undefined;
    const plan = user ? db.prepare('SELECT * FROM plans WHERE id = ?').get(user.plan_id) as Record<string, unknown> | undefined : undefined;

    const links = db.prepare('SELECT * FROM profile_links WHERE profile_id = ? AND is_enabled = 1 ORDER BY sort_order ASC').all(profile.id as number);

    return res.json({
      success: true,
      data: {
        id: profile.id,
        profile_type: 'business',
        biz_slug: profile.biz_slug,
        person_slug: profile.person_slug,
        business_name: profile.business_name,
        display_name: profile.display_name,
        business_description: profile.business_description,
        business_category: profile.business_category,
        phone: profile.show_phone ? profile.phone : null,
        email: profile.show_email ? profile.email : null,
        website: profile.show_website ? profile.website : null,
        address: profile.show_address ? profile.address : null,
        profile_photo: profile.profile_photo,
        logo_url: profile.logo_url,
        cover_url: profile.cover_url,
        opening_hours: profile.opening_hours,
        services: profile.services ? JSON.parse(profile.services as string) : [],
        team_members: profile.team_members ? JSON.parse(profile.team_members as string) : [],
        announcements: profile.announcements ? JSON.parse(profile.announcements as string) : [],
        links,
        plan: {
          has_contact_form: plan?.has_contact_form || 0,
          has_vcard_download: plan?.has_vcard_download || 0,
          remove_branding: plan?.remove_branding || 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch business profile' });
  }
}

// ─── shared helper ────────────────────────────────────────────────────────
function buildPublicProfileResponse(profile: Record<string, unknown>, res: Response) {
  const publicProfile: Record<string, unknown> = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    job_title: profile.job_title,
    company: profile.company,
    profile_photo: profile.profile_photo,
    theme_id: profile.theme_id,
    profile_type: profile.profile_type || 'personal',
    url_prefix: profile.url_prefix || 'F',
    messaging_enabled: profile.messaging_enabled ?? 1,
    enquiry_enabled: profile.enquiry_enabled ?? 1,
  };
  if (profile.show_bio) publicProfile.bio = profile.bio;
  if (profile.show_phone) publicProfile.phone = profile.phone;
  if (profile.show_email) publicProfile.email = profile.email;
  if (profile.show_website) publicProfile.website = profile.website;
  if (profile.show_address) publicProfile.address = profile.address;

  const user = db.prepare('SELECT plan_id FROM users WHERE id = ?').get(profile.user_id as number) as { plan_id: number } | undefined;
  const plan = user ? db.prepare('SELECT * FROM plans WHERE id = ?').get(user.plan_id) as Record<string, unknown> | undefined : undefined;

  publicProfile.plan = {
    has_contact_form: plan?.has_contact_form || 0,
    has_vcard_download: plan?.has_vcard_download || 0,
    remove_branding: plan?.remove_branding || 0,
    has_messaging: plan?.has_messaging || 0,
  };

  const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(profile.theme_id as number);
  publicProfile.theme = theme;

  const links = db.prepare('SELECT * FROM profile_links WHERE profile_id = ? AND is_enabled = 1 ORDER BY sort_order ASC').all(profile.id as number);
  publicProfile.links = links;

  return res.json({ success: true, data: publicProfile });
}
