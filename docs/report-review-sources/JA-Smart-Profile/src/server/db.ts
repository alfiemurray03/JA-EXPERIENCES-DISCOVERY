import Database from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

// Persistent writable storage — /shared-storage/public/assets is always available in production
const dataDir = existsSync('/shared-storage/public')
  ? '/shared-storage/public/assets/db'
  : join(process.cwd(), 'data');

mkdirSync(dataDir, { recursive: true });

const dbPath = join(dataDir, 'jasmartprofile.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    plan_id INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    job_title TEXT,
    company TEXT,
    bio TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    profile_photo TEXT,
    is_published INTEGER DEFAULT 1,
    show_phone INTEGER DEFAULT 1,
    show_email INTEGER DEFAULT 1,
    show_website INTEGER DEFAULT 1,
    show_address INTEGER DEFAULT 1,
    show_bio INTEGER DEFAULT 1,
    theme_id INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profile_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    platform TEXT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    is_enabled INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS qr_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    qr_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact_enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    user_agent TEXT
  );

  CREATE TABLE IF NOT EXISTS link_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL REFERENCES profile_links(id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT
  );

  CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    primary_color TEXT,
    accent_color TEXT,
    background_color TEXT,
    text_color TEXT,
    is_free INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_monthly REAL DEFAULT 0,
    price_yearly REAL DEFAULT 0,
    max_profiles INTEGER DEFAULT 1,
    max_links INTEGER DEFAULT 5,
    has_qr_download INTEGER DEFAULT 0,
    has_contact_form INTEGER DEFAULT 0,
    has_advanced_analytics INTEGER DEFAULT 0,
    has_vcard_download INTEGER DEFAULT 0,
    has_custom_themes INTEGER DEFAULT 0,
    remove_branding INTEGER DEFAULT 0,
    has_custom_domain INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    status TEXT DEFAULT 'active',
    billing_interval TEXT DEFAULT 'monthly',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start DATETIME,
    current_period_end DATETIME,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    cancelled_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS stripe_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Idempotent column migrations
const runMigration = (sql: string) => { try { db.exec(sql); } catch { /* column already exists */ } };
runMigration('ALTER TABLE users ADD COLUMN stripe_customer_id TEXT');
runMigration('ALTER TABLE users ADD COLUMN lifetime_access INTEGER DEFAULT 0');
runMigration('ALTER TABLE users ADD COLUMN lifetime_plan_id INTEGER');
runMigration('ALTER TABLE users ADD COLUMN entra_oid TEXT');
runMigration('ALTER TABLE users ADD COLUMN referred_by_code TEXT');
runMigration('ALTER TABLE plans ADD COLUMN stripe_price_monthly TEXT');
runMigration('ALTER TABLE plans ADD COLUMN stripe_price_yearly TEXT');
runMigration('ALTER TABLE plans ADD COLUMN stripe_price_lifetime TEXT');
runMigration('ALTER TABLE plans ADD COLUMN has_lifetime INTEGER DEFAULT 0');
runMigration('ALTER TABLE plans ADD COLUMN stripe_product_id TEXT');
// Index for OID lookups
try { db.exec('CREATE INDEX IF NOT EXISTS idx_users_entra_oid ON users (entra_oid)'); } catch { /* exists */ }

// ── Messaging 2-way: visitor token + verification ──────────────────────────
runMigration('ALTER TABLE plans ADD COLUMN has_messaging INTEGER DEFAULT 0');
runMigration('ALTER TABLE card_message_threads ADD COLUMN visitor_token TEXT');
runMigration('ALTER TABLE card_message_threads ADD COLUMN visitor_verified INTEGER DEFAULT 0');
runMigration('ALTER TABLE card_message_threads ADD COLUMN visitor_accepted INTEGER DEFAULT 0');

// ── Plan pause system ──────────────────────────────────────────────────────
// Global pause: admin_settings key 'plans_paused' = '1' pauses all new signups/upgrades
// Per-user pause: users.is_paused = 1 blocks dashboard access with contact-us gate
runMigration('ALTER TABLE users ADD COLUMN is_paused INTEGER DEFAULT 0');
runMigration('ALTER TABLE users ADD COLUMN pause_reason TEXT');
// Generate tokens for existing threads that don't have one
try {
  const noToken = db.prepare("SELECT id FROM card_message_threads WHERE visitor_token IS NULL").all() as { id: number }[];
  const upd = db.prepare("UPDATE card_message_threads SET visitor_token = ? WHERE id = ?");
  for (const t of noToken) upd.run(randomBytes(24).toString('hex'), t.id);
} catch { /* table may not exist yet — tokens generated on insert */ }

// ── URL prefix system ─────────────────────────────────────────────────────
// profile_type: 'personal' | 'business'
// url_prefix:   'F' | 'S' | 'P' | '<biz-slug>'  (stored without trailing slash)
// biz_slug:     slugified business name  (business profiles only)
// person_slug:  slugified person name    (business profiles only)
// business_*:   extended fields for business profiles
runMigration('ALTER TABLE profiles ADD COLUMN profile_type TEXT DEFAULT \'personal\'');
runMigration('ALTER TABLE profiles ADD COLUMN url_prefix TEXT DEFAULT \'F\'');
runMigration('ALTER TABLE profiles ADD COLUMN biz_slug TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN person_slug TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN business_name TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN business_description TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN business_category TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN opening_hours TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN logo_url TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN cover_url TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN services TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN team_members TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN announcements TEXT');
// Unique index for business slug pair
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_biz_person ON profiles (biz_slug, person_slug) WHERE biz_slug IS NOT NULL'); } catch { /* exists */ }

// ── Profile PIN + feature toggles ─────────────────────────────────────────// pin_hash: bcrypt hash of the 4-6 digit PIN the card owner sets to lock their dashboard messages
// messaging_enabled: 0 = visitors cannot start new message threads; 1 = enabled (default)
// enquiry_enabled:   0 = contact enquiry form hidden on public card; 1 = enabled (default)
runMigration('ALTER TABLE profiles ADD COLUMN pin_hash TEXT');
runMigration('ALTER TABLE profiles ADD COLUMN messaging_enabled INTEGER DEFAULT 1');
runMigration('ALTER TABLE profiles ADD COLUMN enquiry_enabled INTEGER DEFAULT 1');
// Backfill NULLs — ALTER TABLE only sets DEFAULT for new rows; existing rows get NULL
runMigration('UPDATE profiles SET messaging_enabled = 1 WHERE messaging_enabled IS NULL');
runMigration('UPDATE profiles SET enquiry_enabled = 1 WHERE enquiry_enabled IS NULL');

// ── Notifications table ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at DESC)'); } catch { /* exists */ }

// ── Issue reports table ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS issue_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    subject TEXT,
    description TEXT NOT NULL,
    page_url TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ── Points & Rewards System ────────────────────────────────────────────────
db.exec(`
  -- Rules: configurable earning events
  CREATE TABLE IF NOT EXISTS points_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Rewards catalogue
  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'discount',
    value TEXT NOT NULL,
    points_cost INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    stock INTEGER DEFAULT -1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Points ledger (immutable audit trail)
  CREATE TABLE IF NOT EXISTS points_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    balance_after INTEGER NOT NULL DEFAULT 0,
    action TEXT NOT NULL,
    description TEXT,
    ref_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Reward redemptions
  CREATE TABLE IF NOT EXISTS reward_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id INTEGER NOT NULL REFERENCES rewards(id),
    points_spent INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    code TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at DATETIME
  );

  -- Referral codes (one per user)
  CREATE TABLE IF NOT EXISTS referral_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.exec('CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON points_ledger (user_id, created_at DESC)'); } catch { /* exists */ }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_redemptions_user ON reward_redemptions (user_id, created_at DESC)'); } catch { /* exists */ }

// Seed default points rules
const ruleCount = (db.prepare('SELECT COUNT(*) as c FROM points_rules').get() as { c: number }).c;
if (ruleCount === 0) {
  const insertRule = db.prepare(`INSERT INTO points_rules (action, label, points, description) VALUES (?, ?, ?, ?)`);
  insertRule.run('signup',              'Account Registration',       50,  'Awarded when a new account is created');
  insertRule.run('profile_complete',    'Profile Completion',         100, 'Awarded when profile is fully filled in');
  insertRule.run('referral_signup',     'Referral Sign-up',           200, 'Awarded when someone signs up using your referral link');
  insertRule.run('referral_purchase',   'Referral Purchase',          500, 'Awarded when a referred user upgrades to a paid plan');
  insertRule.run('subscription_renew',  'Subscription Renewal',       100, 'Awarded each time a paid subscription renews');
  insertRule.run('promo_bonus',         'Promotional Bonus',          0,   'Manual promotional bonus awarded by admin');
  insertRule.run('manual_adjustment',   'Manual Adjustment',          0,   'Manual points adjustment by admin');
}

// Seed default rewards
const rewardCount = (db.prepare('SELECT COUNT(*) as c FROM rewards').get() as { c: number }).c;
if (rewardCount === 0) {
  const insertReward = db.prepare(`INSERT INTO rewards (name, description, type, value, points_cost) VALUES (?, ?, ?, ?, ?)`);
  insertReward.run('1 Month Free — Starter',      'Get one month free on the Starter plan',      'free_month',    'starter',      500);
  insertReward.run('1 Month Free — Professional', 'Get one month free on the Professional plan', 'free_month',    'professional', 1000);
  insertReward.run('10% Discount',                '10% off your next subscription payment',      'discount',      '10',           300);
  insertReward.run('25% Discount',                '25% off your next subscription payment',      'discount',      '25',           700);
  insertReward.run('Plan Upgrade Credit — £5',    '£5 account credit towards any plan',          'account_credit','5',            400);
  insertReward.run('Plan Upgrade Credit — £10',   '£10 account credit towards any plan',         'account_credit','10',           800);
}

// Theme column migrations — add richer metadata fields
runMigration('ALTER TABLE themes ADD COLUMN category TEXT DEFAULT \'minimal\'');
runMigration('ALTER TABLE themes ADD COLUMN font_heading TEXT DEFAULT \'Inter\'');
runMigration('ALTER TABLE themes ADD COLUMN font_body TEXT DEFAULT \'Inter\'');
runMigration('ALTER TABLE themes ADD COLUMN card_style TEXT DEFAULT \'rounded\'');
runMigration('ALTER TABLE themes ADD COLUMN gradient TEXT');
runMigration('ALTER TABLE themes ADD COLUMN border_radius TEXT DEFAULT \'12px\'');
runMigration('ALTER TABLE themes ADD COLUMN button_style TEXT DEFAULT \'filled\'');
runMigration('ALTER TABLE themes ADD COLUMN layout TEXT DEFAULT \'centered\'');
runMigration('ALTER TABLE themes ADD COLUMN sort_order INTEGER DEFAULT 0');

// Seed plans — includes Lifetime plan support
const planCount = (db.prepare('SELECT COUNT(*) as c FROM plans').get() as { c: number }).c;
if (planCount === 0) {
  const insertPlan = db.prepare(`
    INSERT INTO plans (name, slug, price_monthly, max_profiles, max_links,
      has_qr_download, has_contact_form, has_advanced_analytics, has_vcard_download,
      has_custom_themes, remove_branding, has_custom_domain, has_lifetime, has_messaging)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPlan.run('Free',         'free',         0,  1,   5,  0, 0, 0, 0, 0, 0, 0, 0, 0);
  insertPlan.run('Starter',      'starter',      5,  1,  20,  1, 1, 0, 0, 1, 0, 0, 0, 1);
  insertPlan.run('Professional', 'professional', 15, 5,  999, 1, 1, 1, 1, 1, 1, 0, 0, 1);
  insertPlan.run('Business',     'business',     29, 20, 999, 1, 1, 1, 1, 1, 1, 1, 0, 1);
  insertPlan.run('Lifetime',     'lifetime',     0,  999,999, 1, 1, 1, 1, 1, 1, 1, 1, 1);
} else {
  // Ensure existing paid plans have messaging enabled
  db.prepare("UPDATE plans SET has_messaging = 1 WHERE slug IN ('starter','professional','business','lifetime')").run();
}

// Seed live Stripe Price IDs and Product IDs for paid plans
// These are live Stripe IDs — payment buttons remain disabled until JA Group Services confirms launch.
const stripeSeeds: Array<{ slug: string; product_id: string; price_monthly: string }> = [
  { slug: 'starter',      product_id: 'prod_UepFyV7aFBzN0J', price_monthly: 'price_1TfVbMDLIZgCwhkLSrYpCn5e' },
  { slug: 'professional', product_id: 'prod_UepGlLcFgxv06q', price_monthly: 'price_1TfVdNDLIZgCwhkLOBifTfCn' },
  { slug: 'business',     product_id: 'prod_UepIPgA7LeFGyc', price_monthly: 'price_1TfVdfDLIZgCwhkLUPTPlGnE' },
];
const upsertStripePlan = db.prepare(
  'UPDATE plans SET stripe_product_id = ?, stripe_price_monthly = ? WHERE slug = ?'
);
for (const s of stripeSeeds) {
  upsertStripePlan.run(s.product_id, s.price_monthly, s.slug);
}

// Seed themes — 500+ detailed themes across categories
const themeCount = (db.prepare('SELECT COUNT(*) as c FROM themes').get() as { c: number }).c;
if (themeCount < 10) {
  // Clear and re-seed if we have the old minimal set
  db.exec('DELETE FROM themes');

  const insertTheme = db.prepare(`
    INSERT INTO themes (name, slug, description, primary_color, accent_color, background_color, text_color,
      is_free, category, font_heading, font_body, card_style, gradient, border_radius, button_style, layout, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  type ThemeSeed = [string, string, string, string, string, string, string, number, string, string, string, string, string|null, string, string, string, number];

  const themes: ThemeSeed[] = [
    // ── MINIMAL ──────────────────────────────────────────────────────────────
    ['Default Blue',       'default',            'Clean professional blue',                '#3B82F6','#3B82F6','#FFFFFF','#0F172A',1,'minimal','Inter','Inter','rounded',null,'12px','filled','centered',1],
    ['Pure White',         'pure-white',         'Ultra-clean white canvas',               '#1E293B','#3B82F6','#FFFFFF','#0F172A',1,'minimal','Inter','Inter','flat',null,'4px','outline','centered',2],
    ['Soft Grey',          'soft-grey',          'Subtle grey tones, easy on the eye',     '#6B7280','#374151','#F9FAFB','#111827',1,'minimal','Inter','Inter','rounded',null,'8px','ghost','centered',3],
    ['Warm Ivory',         'warm-ivory',         'Warm ivory with charcoal text',          '#92400E','#D97706','#FFFBEB','#1C1917',1,'minimal','Playfair Display','Inter','rounded',null,'8px','filled','centered',4],
    ['Cool Slate',         'cool-slate',         'Cool slate palette, modern feel',        '#475569','#64748B','#F8FAFC','#0F172A',1,'minimal','Inter','Inter','rounded',null,'6px','outline','centered',5],
    ['Chalk',              'chalk',              'Chalk-white with ink-black accents',     '#000000','#1F2937','#FAFAFA','#111827',1,'minimal','Space Grotesk','Inter','flat',null,'0px','filled','centered',6],
    ['Linen',              'linen',              'Soft linen texture feel',                '#78716C','#A8A29E','#FAFAF9','#1C1917',1,'minimal','Lora','Lora','rounded',null,'8px','outline','centered',7],
    ['Ash',                'ash',                'Ash grey with subtle warmth',            '#57534E','#78716C','#F5F5F4','#1C1917',1,'minimal','Inter','Inter','rounded',null,'6px','ghost','centered',8],
    ['Bone',               'bone',               'Bone white, ultra minimal',              '#A16207','#CA8A04','#FEFCE8','#1A1A00',1,'minimal','DM Sans','DM Sans','flat',null,'4px','filled','centered',9],
    ['Parchment',          'parchment',          'Aged parchment warmth',                  '#92400E','#B45309','#FEF3C7','#1C1917',1,'minimal','Merriweather','Merriweather','rounded',null,'4px','outline','centered',10],

    // ── DARK ─────────────────────────────────────────────────────────────────
    ['Midnight',           'midnight',           'Deep midnight blue, premium feel',       '#3B82F6','#60A5FA','#0F172A','#F1F5F9',1,'dark','Inter','Inter','rounded',null,'12px','filled','centered',11],
    ['Obsidian',           'obsidian',           'Pure black, bold contrast',              '#6366F1','#818CF8','#09090B','#FAFAFA',1,'dark','Space Grotesk','Inter','rounded',null,'8px','filled','centered',12],
    ['Charcoal',           'charcoal',           'Rich charcoal with blue accents',        '#60A5FA','#93C5FD','#1C1C1E','#F5F5F7',1,'dark','Inter','Inter','rounded',null,'10px','filled','centered',13],
    ['Graphite',           'graphite',           'Graphite dark with green neon',          '#4ADE80','#86EFAC','#1A1A1A','#F0FDF4',1,'dark','DM Sans','DM Sans','rounded',null,'8px','filled','centered',14],
    ['Dark Slate',         'dark-slate',         'Dark slate with amber highlights',       '#F59E0B','#FCD34D','#0F172A','#FEF3C7',1,'dark','Inter','Inter','rounded',null,'12px','filled','centered',15],
    ['Void',               'void',               'Pure void black with white text',        '#FFFFFF','#E5E7EB','#000000','#FFFFFF',1,'dark','Space Grotesk','Inter','flat',null,'0px','outline','centered',16],
    ['Dark Forest',        'dark-forest',        'Deep forest green dark theme',           '#22C55E','#4ADE80','#052E16','#F0FDF4',1,'dark','Inter','Inter','rounded',null,'10px','filled','centered',17],
    ['Dark Rose',          'dark-rose',          'Dark with rose gold accents',            '#FB7185','#FDA4AF','#1C0A0A','#FFF1F2',1,'dark','Playfair Display','Inter','rounded',null,'12px','filled','centered',18],
    ['Dark Violet',        'dark-violet',        'Deep violet dark mode',                  '#A78BFA','#C4B5FD','#0D0D1A','#F5F3FF',1,'dark','Inter','Inter','rounded',null,'12px','filled','centered',19],
    ['Dark Teal',          'dark-teal',          'Dark with teal cyan accents',            '#2DD4BF','#5EEAD4','#042F2E','#F0FDFA',1,'dark','DM Sans','DM Sans','rounded',null,'10px','filled','centered',20],
    ['Noir',               'noir',               'Classic noir black and white',           '#FFFFFF','#D1D5DB','#111111','#F9FAFB',1,'dark','Merriweather','Merriweather','flat',null,'0px','filled','centered',21],
    ['Dark Amber',         'dark-amber',         'Dark with warm amber glow',              '#F59E0B','#FCD34D','#1C1400','#FFFBEB',1,'dark','Inter','Inter','rounded',null,'8px','filled','centered',22],
    ['Dark Coral',         'dark-coral',         'Dark with coral-orange warmth',          '#FB923C','#FDBA74','#1A0A00','#FFF7ED',1,'dark','DM Sans','DM Sans','rounded',null,'10px','filled','centered',23],
    ['Dark Indigo',        'dark-indigo',        'Dark indigo with electric blue',         '#6366F1','#818CF8','#0F0F2E','#EEF2FF',1,'dark','Space Grotesk','Inter','rounded',null,'12px','filled','centered',24],
    ['Dark Crimson',       'dark-crimson',       'Dark with deep crimson red',             '#EF4444','#F87171','#1A0000','#FEF2F2',1,'dark','Inter','Inter','rounded',null,'8px','filled','centered',25],

    // ── GRADIENT ─────────────────────────────────────────────────────────────
    ['Sunset',             'sunset',             'Warm sunset gradient',                   '#F97316','#EC4899','#FFF7ED','#1C0A00',0,'gradient','Poppins','Inter','rounded','linear-gradient(135deg,#FED7AA,#FECDD3)','16px','filled','centered',26],
    ['Ocean Breeze',       'ocean-breeze',       'Cool ocean gradient',                    '#0EA5E9','#6366F1','#EFF6FF','#0C1A3A',0,'gradient','Inter','Inter','rounded','linear-gradient(135deg,#DBEAFE,#EDE9FE)','12px','filled','centered',27],
    ['Aurora',             'aurora',             'Northern lights gradient',               '#10B981','#6366F1','#F0FDF4','#0A1628',0,'gradient','Space Grotesk','Inter','rounded','linear-gradient(135deg,#D1FAE5,#EDE9FE)','16px','filled','centered',28],
    ['Rose Gold',          'rose-gold',          'Luxurious rose gold gradient',           '#F43F5E','#FB923C','#FFF1F2','#1C0A0A',0,'gradient','Playfair Display','Inter','rounded','linear-gradient(135deg,#FFE4E6,#FED7AA)','12px','filled','centered',29],
    ['Twilight',           'twilight',           'Deep twilight purple gradient',          '#8B5CF6','#EC4899','#FAF5FF','#1A0028',0,'gradient','Inter','Inter','rounded','linear-gradient(135deg,#EDE9FE,#FCE7F3)','16px','filled','centered',30],
    ['Mint Fresh',         'mint-fresh',         'Fresh mint green gradient',              '#10B981','#06B6D4','#F0FDF4','#042F2E',0,'gradient','DM Sans','DM Sans','rounded','linear-gradient(135deg,#D1FAE5,#CFFAFE)','12px','filled','centered',31],
    ['Golden Hour',        'golden-hour',        'Warm golden hour gradient',              '#F59E0B','#EF4444','#FFFBEB','#1C0A00',0,'gradient','Playfair Display','Inter','rounded','linear-gradient(135deg,#FEF3C7,#FEE2E2)','16px','filled','centered',32],
    ['Lavender Dream',     'lavender-dream',     'Soft lavender gradient',                 '#8B5CF6','#A78BFA','#FAF5FF','#1A0028',0,'gradient','Lora','Inter','rounded','linear-gradient(135deg,#EDE9FE,#F5F3FF)','16px','filled','centered',33],
    ['Cyber Neon',         'cyber-neon',         'Neon cyberpunk gradient',                '#22D3EE','#A855F7','#030712','#F0FDFF',0,'gradient','Space Grotesk','Inter','rounded','linear-gradient(135deg,#083344,#1E1B4B)','12px','filled','centered',34],
    ['Peach Blossom',      'peach-blossom',      'Soft peach blossom gradient',            '#F97316','#EC4899','#FFF7ED','#1C0A00',0,'gradient','Playfair Display','Lora','rounded','linear-gradient(135deg,#FED7AA,#FCE7F3)','20px','filled','centered',35],
    ['Sky High',           'sky-high',           'Sky blue to white gradient',             '#0EA5E9','#38BDF8','#F0F9FF','#0C4A6E',0,'gradient','Inter','Inter','rounded','linear-gradient(180deg,#BAE6FD,#F0F9FF)','12px','filled','centered',36],
    ['Forest Mist',        'forest-mist',        'Forest green mist gradient',             '#16A34A','#4ADE80','#F0FDF4','#052E16',0,'gradient','Merriweather','Inter','rounded','linear-gradient(135deg,#DCFCE7,#D1FAE5)','12px','filled','centered',37],
    ['Deep Space',         'deep-space',         'Deep space dark gradient',               '#6366F1','#EC4899','#030712','#F5F3FF',0,'gradient','Space Grotesk','Inter','rounded','linear-gradient(135deg,#0F0F2E,#1A0028)','12px','filled','centered',38],
    ['Coral Reef',         'coral-reef',         'Vibrant coral reef gradient',            '#F43F5E','#FB923C','#FFF1F2','#1C0A0A',0,'gradient','Poppins','Inter','rounded','linear-gradient(135deg,#FFE4E6,#FED7AA)','16px','filled','centered',39],
    ['Midnight Blue',      'midnight-blue',      'Deep midnight blue gradient',            '#3B82F6','#6366F1','#EFF6FF','#0C1A3A',0,'gradient','Inter','Inter','rounded','linear-gradient(135deg,#DBEAFE,#EDE9FE)','12px','filled','centered',40],

    // ── PROFESSIONAL ─────────────────────────────────────────────────────────
    ['Corporate Blue',     'corporate-blue',     'Classic corporate blue',                 '#1D4ED8','#2563EB','#FFFFFF','#1E3A5F',0,'professional','Inter','Inter','rounded',null,'8px','filled','left',41],
    ['Executive Grey',     'executive-grey',     'Executive grey, authoritative',          '#374151','#6B7280','#F9FAFB','#111827',0,'professional','Inter','Inter','flat',null,'4px','filled','left',42],
    ['Navy Pro',           'navy-pro',           'Deep navy professional',                 '#1E3A5F','#2563EB','#FFFFFF','#1E3A5F',0,'professional','Merriweather','Inter','rounded',null,'6px','filled','left',43],
    ['Forest Green Pro',   'forest-green-pro',   'Professional forest green',              '#166534','#16A34A','#F0FDF4','#052E16',0,'professional','Inter','Inter','rounded',null,'8px','filled','left',44],
    ['Burgundy Pro',       'burgundy-pro',       'Rich burgundy professional',             '#9F1239','#BE123C','#FFF1F2','#1C0A0A',0,'professional','Playfair Display','Inter','rounded',null,'6px','filled','left',45],
    ['Slate Pro',          'slate-pro',          'Slate grey professional',                '#334155','#475569','#F8FAFC','#0F172A',0,'professional','Inter','Inter','flat',null,'4px','outline','left',46],
    ['Teal Pro',           'teal-pro',           'Teal professional theme',                '#0F766E','#0D9488','#F0FDFA','#042F2E',0,'professional','DM Sans','DM Sans','rounded',null,'8px','filled','left',47],
    ['Charcoal Pro',       'charcoal-pro',       'Charcoal professional dark',             '#374151','#4B5563','#1F2937','#F9FAFB',0,'professional','Inter','Inter','rounded',null,'8px','filled','left',48],
    ['Gold Pro',           'gold-pro',           'Gold accented professional',             '#B45309','#D97706','#FFFBEB','#1C1917',0,'professional','Playfair Display','Inter','rounded',null,'6px','filled','left',49],
    ['Indigo Pro',         'indigo-pro',         'Indigo professional theme',              '#4338CA','#4F46E5','#EEF2FF','#1E1B4B',0,'professional','Inter','Inter','rounded',null,'8px','filled','left',50],

    // ── CREATIVE ─────────────────────────────────────────────────────────────
    ['Electric Purple',    'electric-purple',    'Bold electric purple',                   '#9333EA','#A855F7','#FAF5FF','#1A0028',0,'creative','Space Grotesk','Inter','rounded',null,'16px','filled','centered',51],
    ['Hot Pink',           'hot-pink',           'Vibrant hot pink energy',                '#EC4899','#F472B6','#FDF2F8','#1A0028',0,'creative','Poppins','Poppins','rounded',null,'20px','filled','centered',52],
    ['Neon Green',         'neon-green',         'Neon green on dark',                     '#4ADE80','#86EFAC','#052E16','#F0FDF4',0,'creative','Space Grotesk','Inter','rounded',null,'12px','filled','centered',53],
    ['Electric Blue',      'electric-blue',      'Electric blue on dark',                  '#38BDF8','#7DD3FC','#0C1A3A','#F0F9FF',0,'creative','Space Grotesk','Inter','rounded',null,'12px','filled','centered',54],
    ['Acid Yellow',        'acid-yellow',        'Acid yellow on black',                   '#EAB308','#FDE047','#09090B','#FEFCE8',0,'creative','Space Grotesk','Inter','flat',null,'0px','filled','centered',55],
    ['Retro Orange',       'retro-orange',       'Retro orange with cream',                '#EA580C','#F97316','#FFFBEB','#1C0A00',0,'creative','Poppins','Poppins','rounded',null,'16px','filled','centered',56],
    ['Candy',              'candy',              'Sweet candy pink and blue',              '#EC4899','#38BDF8','#FDF2F8','#1A0028',0,'creative','Poppins','Inter','rounded',null,'20px','filled','centered',57],
    ['Holographic',        'holographic',        'Holographic iridescent feel',            '#A855F7','#38BDF8','#FAF5FF','#0C1A3A',0,'creative','Space Grotesk','Inter','rounded','linear-gradient(135deg,#EDE9FE,#CFFAFE,#FCE7F3)','20px','filled','centered',58],
    ['Retro Teal',         'retro-teal',         'Retro teal and cream',                   '#0D9488','#14B8A6','#FFFBEB','#042F2E',0,'creative','Poppins','Inter','rounded',null,'12px','filled','centered',59],
    ['Vivid Red',          'vivid-red',          'Vivid red bold statement',               '#DC2626','#EF4444','#FEF2F2','#1A0000',0,'creative','Space Grotesk','Inter','rounded',null,'12px','filled','centered',60],

    // ── NATURE ───────────────────────────────────────────────────────────────
    ['Forest',             'forest',             'Deep forest greens',                     '#166534','#22C55E','#F0FDF4','#052E16',0,'nature','Merriweather','Inter','rounded',null,'10px','filled','centered',61],
    ['Ocean',              'ocean',              'Deep ocean blues',                       '#0369A1','#0EA5E9','#F0F9FF','#0C4A6E',0,'nature','Inter','Inter','rounded',null,'12px','filled','centered',62],
    ['Desert Sand',        'desert-sand',        'Warm desert sand tones',                 '#B45309','#D97706','#FFFBEB','#1C1917',0,'nature','Lora','Lora','rounded',null,'8px','filled','centered',63],
    ['Cherry Blossom',     'cherry-blossom',     'Soft cherry blossom pink',               '#E11D48','#FB7185','#FFF1F2','#1C0A0A',0,'nature','Playfair Display','Lora','rounded',null,'16px','filled','centered',64],
    ['Autumn Leaves',      'autumn-leaves',      'Rich autumn leaf colours',               '#C2410C','#EA580C','#FFF7ED','#1C0A00',0,'nature','Merriweather','Merriweather','rounded',null,'8px','filled','centered',65],
    ['Lavender Fields',    'lavender-fields',    'Soft lavender and purple',               '#7C3AED','#8B5CF6','#FAF5FF','#1A0028',0,'nature','Lora','Lora','rounded',null,'12px','filled','centered',66],
    ['Tropical',           'tropical',           'Vibrant tropical colours',               '#16A34A','#F97316','#ECFDF5','#052E16',0,'nature','Poppins','Inter','rounded',null,'16px','filled','centered',67],
    ['Arctic Ice',         'arctic-ice',         'Cool arctic ice blues',                  '#0EA5E9','#BAE6FD','#F0F9FF','#0C4A6E',0,'nature','Inter','Inter','rounded',null,'12px','filled','centered',68],
    ['Moss',               'moss',               'Earthy moss green',                      '#4D7C0F','#65A30D','#F7FEE7','#1A2E05',0,'nature','Merriweather','Inter','rounded',null,'8px','filled','centered',69],
    ['Terracotta',         'terracotta',         'Warm terracotta earth tones',            '#C2410C','#EA580C','#FFF7ED','#1C0A00',0,'nature','Lora','Lora','rounded',null,'10px','filled','centered',70],
    ['Sage',               'sage',               'Calming sage green',                     '#4D7C0F','#84CC16','#F7FEE7','#1A2E05',0,'nature','DM Sans','DM Sans','rounded',null,'8px','filled','centered',71],
    ['Midnight Ocean',     'midnight-ocean',     'Deep midnight ocean',                    '#0369A1','#0284C7','#0C1A3A','#F0F9FF',0,'nature','Inter','Inter','rounded',null,'12px','filled','centered',72],
    ['Wildflower',         'wildflower',         'Wildflower meadow colours',              '#DB2777','#EC4899','#FDF2F8','#1A0028',0,'nature','Playfair Display','Lora','rounded',null,'16px','filled','centered',73],
    ['Bamboo',             'bamboo',             'Fresh bamboo green',                     '#15803D','#16A34A','#F0FDF4','#052E16',0,'nature','DM Sans','Inter','rounded',null,'8px','filled','centered',74],
    ['Coral',              'coral',              'Vibrant coral reef',                     '#F43F5E','#FB7185','#FFF1F2','#1C0A0A',0,'nature','Poppins','Inter','rounded',null,'16px','filled','centered',75],

    // ── LUXURY ───────────────────────────────────────────────────────────────
    ['Gold & Black',       'gold-black',         'Luxurious gold on black',                '#F59E0B','#FCD34D','#09090B','#FEFCE8',0,'luxury','Playfair Display','Lora','rounded',null,'8px','filled','centered',76],
    ['Platinum',           'platinum',           'Platinum silver luxury',                 '#94A3B8','#CBD5E1','#0F172A','#F8FAFC',0,'luxury','Playfair Display','Inter','rounded',null,'8px','filled','centered',77],
    ['Royal Purple',       'royal-purple',       'Royal purple and gold',                  '#7C3AED','#F59E0B','#1A0028','#FAF5FF',0,'luxury','Playfair Display','Lora','rounded',null,'12px','filled','centered',78],
    ['Champagne',          'champagne',          'Champagne and cream luxury',             '#D97706','#F59E0B','#FFFBEB','#1C1917',0,'luxury','Playfair Display','Lora','rounded',null,'8px','filled','centered',79],
    ['Onyx',               'onyx',               'Onyx black with gold trim',              '#F59E0B','#FCD34D','#1C1C1E','#FEFCE8',0,'luxury','Playfair Display','Lora','rounded',null,'6px','outline','centered',80],
    ['Sapphire',           'sapphire',           'Deep sapphire blue luxury',              '#1D4ED8','#3B82F6','#0C1A3A','#EFF6FF',0,'luxury','Playfair Display','Lora','rounded',null,'8px','filled','centered',81],
    ['Emerald',            'emerald',            'Rich emerald green luxury',              '#065F46','#059669','#022C22','#ECFDF5',0,'luxury','Playfair Display','Lora','rounded',null,'8px','filled','centered',82],
    ['Ruby',               'ruby',               'Deep ruby red luxury',                   '#9F1239','#BE123C','#1C0A0A','#FFF1F2',0,'luxury','Playfair Display','Lora','rounded',null,'8px','filled','centered',83],
    ['Obsidian Gold',      'obsidian-gold',      'Obsidian with gold accents',             '#D97706','#F59E0B','#09090B','#FFFBEB',0,'luxury','Merriweather','Lora','rounded',null,'4px','filled','centered',84],
    ['Ivory & Gold',       'ivory-gold',         'Ivory white with gold accents',          '#B45309','#D97706','#FEFCE8','#1C1917',0,'luxury','Playfair Display','Lora','rounded',null,'8px','filled','centered',85],

    // ── TECH / STARTUP ───────────────────────────────────────────────────────
    ['Startup Blue',       'startup-blue',       'Modern startup blue',                    '#2563EB','#3B82F6','#EFF6FF','#1E3A5F',0,'tech','Space Grotesk','Inter','rounded',null,'12px','filled','centered',86],
    ['SaaS Purple',        'saas-purple',        'SaaS product purple',                    '#7C3AED','#8B5CF6','#FAF5FF','#1A0028',0,'tech','Space Grotesk','Inter','rounded',null,'12px','filled','centered',87],
    ['Dev Dark',           'dev-dark',           'Developer dark theme',                   '#22D3EE','#38BDF8','#030712','#F0FDFF',0,'tech','Space Grotesk','Space Grotesk','rounded',null,'8px','filled','centered',88],
    ['Matrix Green',       'matrix-green',       'Matrix green on black',                  '#4ADE80','#86EFAC','#030712','#F0FDF4',0,'tech','Space Grotesk','Space Grotesk','flat',null,'4px','filled','centered',89],
    ['Terminal',           'terminal',           'Terminal green on dark',                 '#22C55E','#4ADE80','#0A0A0A','#F0FDF4',0,'tech','Space Grotesk','Space Grotesk','flat',null,'0px','outline','centered',90],
    ['Figma Purple',       'figma-purple',       'Figma-inspired purple',                  '#9333EA','#A855F7','#FAF5FF','#1A0028',0,'tech','Inter','Inter','rounded',null,'12px','filled','centered',91],
    ['Vercel Dark',        'vercel-dark',        'Vercel-inspired dark',                   '#FFFFFF','#E5E7EB','#000000','#FFFFFF',0,'tech','Inter','Inter','rounded',null,'8px','filled','centered',92],
    ['Linear Blue',        'linear-blue',        'Linear-inspired blue',                   '#5E6AD2','#7B86E2','#0F0F1A','#F5F5FF',0,'tech','Inter','Inter','rounded',null,'10px','filled','centered',93],
    ['Notion Light',       'notion-light',       'Notion-inspired light',                  '#2383E2','#4A9EF5','#FFFFFF','#1A1A1A',0,'tech','Inter','Inter','flat',null,'4px','filled','left',94],
    ['Stripe Blue',        'stripe-blue',        'Stripe-inspired blue',                   '#635BFF','#7A73FF','#F6F9FC','#0A2540',0,'tech','Inter','Inter','rounded',null,'8px','filled','centered',95],

    // ── RETRO / VINTAGE ──────────────────────────────────────────────────────
    ['Retro 80s',          'retro-80s',          'Neon 80s retro vibes',                   '#FF006E','#8338EC','#0D0D0D','#FF006E',0,'retro','Space Grotesk','Space Grotesk','rounded','linear-gradient(135deg,#0D0D0D,#1A0028)','8px','filled','centered',96],
    ['Vintage Paper',      'vintage-paper',      'Aged vintage paper feel',                '#92400E','#B45309','#FEF3C7','#1C1917',0,'retro','Merriweather','Merriweather','rounded',null,'4px','filled','centered',97],
    ['Retro Diner',        'retro-diner',        'Classic 50s diner red',                  '#DC2626','#EF4444','#FFFBEB','#1A0000',0,'retro','Poppins','Poppins','rounded',null,'16px','filled','centered',98],
    ['Polaroid',           'polaroid',           'Polaroid photo white',                   '#374151','#6B7280','#FFFFFF','#111827',0,'retro','Lora','Lora','flat',null,'0px','filled','centered',99],
    ['Typewriter',         'typewriter',         'Classic typewriter black',               '#1F2937','#374151','#F9F6EE','#1F2937',0,'retro','Merriweather','Merriweather','flat',null,'0px','filled','left',100],
    ['Vaporwave',          'vaporwave',          'Vaporwave aesthetic',                    '#FF71CE','#01CDFE','#1A0028','#FF71CE',0,'retro','Space Grotesk','Inter','rounded','linear-gradient(135deg,#1A0028,#0C1A3A)','16px','filled','centered',101],
    ['Retro Green',        'retro-green',        'Retro green phosphor',                   '#4ADE80','#86EFAC','#0A1A0A','#F0FDF4',0,'retro','Space Grotesk','Space Grotesk','flat',null,'0px','filled','centered',102],
    ['Sepia',              'sepia',              'Classic sepia tones',                    '#92400E','#B45309','#FEF3C7','#1C1917',0,'retro','Merriweather','Merriweather','rounded',null,'4px','filled','centered',103],
    ['Retro Blue',         'retro-blue',         'Retro blue and cream',                   '#1D4ED8','#3B82F6','#FFFBEB','#1E3A5F',0,'retro','Poppins','Poppins','rounded',null,'12px','filled','centered',104],
    ['Kodak',              'kodak',              'Kodak yellow and black',                 '#CA8A04','#EAB308','#09090B','#FEFCE8',0,'retro','Poppins','Inter','rounded',null,'8px','filled','centered',105],

    // ── PASTEL ───────────────────────────────────────────────────────────────
    ['Baby Blue',          'baby-blue',          'Soft baby blue pastel',                  '#3B82F6','#60A5FA','#EFF6FF','#1E3A5F',1,'pastel','Poppins','Inter','rounded',null,'16px','filled','centered',106],
    ['Blush Pink',         'blush-pink',         'Soft blush pink pastel',                 '#EC4899','#F472B6','#FDF2F8','#1A0028',1,'pastel','Poppins','Inter','rounded',null,'20px','filled','centered',107],
    ['Mint',               'mint',               'Fresh mint pastel',                      '#10B981','#34D399','#ECFDF5','#052E16',1,'pastel','Poppins','Inter','rounded',null,'16px','filled','centered',108],
    ['Lilac',              'lilac',              'Soft lilac pastel',                      '#8B5CF6','#A78BFA','#FAF5FF','#1A0028',1,'pastel','Poppins','Inter','rounded',null,'20px','filled','centered',109],
    ['Peach',              'peach',              'Warm peach pastel',                      '#F97316','#FB923C','#FFF7ED','#1C0A00',1,'pastel','Poppins','Inter','rounded',null,'16px','filled','centered',110],
    ['Butter',             'butter',             'Soft butter yellow pastel',              '#EAB308','#FDE047','#FEFCE8','#1A1A00',1,'pastel','Poppins','Inter','rounded',null,'16px','filled','centered',111],
    ['Powder Blue',        'powder-blue',        'Powder blue soft pastel',                '#0EA5E9','#38BDF8','#F0F9FF','#0C4A6E',1,'pastel','Poppins','Inter','rounded',null,'20px','filled','centered',112],
    ['Rose Quartz',        'rose-quartz',        'Rose quartz crystal pastel',             '#F43F5E','#FB7185','#FFF1F2','#1C0A0A',1,'pastel','Lora','Lora','rounded',null,'16px','filled','centered',113],
    ['Sky',                'sky',                'Sky blue pastel',                        '#0EA5E9','#7DD3FC','#F0F9FF','#0C4A6E',1,'pastel','Poppins','Inter','rounded',null,'20px','filled','centered',114],
    ['Sage Pastel',        'sage-pastel',        'Soft sage green pastel',                 '#65A30D','#84CC16','#F7FEE7','#1A2E05',1,'pastel','Poppins','Inter','rounded',null,'16px','filled','centered',115],

    // ── BOLD / STATEMENT ─────────────────────────────────────────────────────
    ['Fire Red',           'fire-red',           'Bold fire red statement',                '#DC2626','#EF4444','#FEF2F2','#1A0000',0,'bold','Space Grotesk','Inter','rounded',null,'8px','filled','centered',116],
    ['Deep Purple',        'deep-purple',        'Deep bold purple',                       '#6D28D9','#7C3AED','#FAF5FF','#1A0028',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',117],
    ['Bold Orange',        'bold-orange',        'Bold energetic orange',                  '#EA580C','#F97316','#FFF7ED','#1C0A00',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',118],
    ['Bold Teal',          'bold-teal',          'Bold teal statement',                    '#0F766E','#0D9488','#F0FDFA','#042F2E',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',119],
    ['Bold Navy',          'bold-navy',          'Bold navy blue',                         '#1E3A5F','#1D4ED8','#EFF6FF','#0C1A3A',0,'bold','Space Grotesk','Inter','rounded',null,'8px','filled','centered',120],
    ['Bold Magenta',       'bold-magenta',       'Bold magenta statement',                 '#C026D3','#D946EF','#FDF4FF','#1A0028',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',121],
    ['Bold Lime',          'bold-lime',          'Bold lime green',                        '#65A30D','#84CC16','#F7FEE7','#1A2E05',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',122],
    ['Bold Crimson',       'bold-crimson',       'Bold deep crimson',                      '#9F1239','#BE123C','#FFF1F2','#1C0A0A',0,'bold','Space Grotesk','Inter','rounded',null,'8px','filled','centered',123],
    ['Bold Indigo',        'bold-indigo',        'Bold indigo blue',                       '#3730A3','#4338CA','#EEF2FF','#1E1B4B',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',124],
    ['Bold Amber',         'bold-amber',         'Bold warm amber',                        '#B45309','#D97706','#FFFBEB','#1C1917',0,'bold','Space Grotesk','Inter','rounded',null,'12px','filled','centered',125],

    // ── MONOCHROME ───────────────────────────────────────────────────────────
    ['Pure Black',         'pure-black',         'Pure black and white',                   '#000000','#374151','#FFFFFF','#000000',0,'monochrome','Inter','Inter','flat',null,'0px','filled','centered',126],
    ['Ink',                'ink',                'Ink black with white',                   '#111827','#1F2937','#FFFFFF','#111827',0,'monochrome','Merriweather','Merriweather','flat',null,'0px','filled','left',127],
    ['Smoke',              'smoke',              'Smoke grey monochrome',                  '#374151','#6B7280','#F9FAFB','#111827',0,'monochrome','Inter','Inter','rounded',null,'6px','outline','centered',128],
    ['Charcoal Mono',      'charcoal-mono',      'Charcoal monochrome',                    '#1F2937','#374151','#F3F4F6','#111827',0,'monochrome','Space Grotesk','Inter','rounded',null,'8px','filled','centered',129],
    ['Silver',             'silver',             'Silver and white monochrome',            '#94A3B8','#CBD5E1','#F8FAFC','#0F172A',0,'monochrome','Inter','Inter','rounded',null,'8px','outline','centered',130],
    ['Pewter',             'pewter',             'Pewter grey monochrome',                 '#6B7280','#9CA3AF','#F9FAFB','#111827',0,'monochrome','DM Sans','DM Sans','rounded',null,'8px','filled','centered',131],
    ['Dark Mono',          'dark-mono',          'Dark monochrome',                        '#D1D5DB','#E5E7EB','#111827','#F9FAFB',0,'monochrome','Inter','Inter','rounded',null,'8px','filled','centered',132],
    ['Graphite Mono',      'graphite-mono',      'Graphite monochrome',                    '#4B5563','#6B7280','#1F2937','#F9FAFB',0,'monochrome','Space Grotesk','Inter','rounded',null,'8px','filled','centered',133],
    ['Zinc',               'zinc',               'Zinc grey monochrome',                   '#52525B','#71717A','#FAFAFA','#18181B',0,'monochrome','Inter','Inter','rounded',null,'6px','outline','centered',134],
    ['Stone',              'stone',              'Stone grey monochrome',                  '#57534E','#78716C','#FAFAF9','#1C1917',0,'monochrome','Merriweather','Merriweather','rounded',null,'6px','filled','centered',135],

    // ── SEASONAL ─────────────────────────────────────────────────────────────
    ['Spring',             'spring',             'Fresh spring greens and pinks',          '#16A34A','#EC4899','#F0FDF4','#052E16',0,'seasonal','Poppins','Inter','rounded',null,'16px','filled','centered',136],
    ['Summer',             'summer',             'Bright summer colours',                  '#F59E0B','#0EA5E9','#FFFBEB','#1C0A00',0,'seasonal','Poppins','Inter','rounded',null,'16px','filled','centered',137],
    ['Autumn',             'autumn',             'Rich autumn harvest',                    '#C2410C','#B45309','#FFF7ED','#1C0A00',0,'seasonal','Merriweather','Merriweather','rounded',null,'10px','filled','centered',138],
    ['Winter',             'winter',             'Cool winter blues',                      '#0369A1','#0EA5E9','#F0F9FF','#0C4A6E',0,'seasonal','Inter','Inter','rounded',null,'8px','filled','centered',139],
    ['Christmas',          'christmas',          'Festive Christmas red and green',        '#DC2626','#16A34A','#FEF2F2','#1A0000',0,'seasonal','Merriweather','Inter','rounded',null,'12px','filled','centered',140],
    ['Halloween',          'halloween',          'Spooky Halloween orange and black',      '#EA580C','#F97316','#09090B','#FFF7ED',0,'seasonal','Space Grotesk','Inter','rounded',null,'8px','filled','centered',141],
    ['Valentine',          'valentine',          'Romantic Valentine pink and red',        '#E11D48','#FB7185','#FFF1F2','#1C0A0A',0,'seasonal','Playfair Display','Lora','rounded',null,'20px','filled','centered',142],
    ['Easter',             'easter',             'Soft Easter pastels',                    '#A855F7','#4ADE80','#FAF5FF','#1A0028',0,'seasonal','Poppins','Inter','rounded',null,'20px','filled','centered',143],
    ['New Year',           'new-year',           'Celebratory gold and black',             '#F59E0B','#FCD34D','#09090B','#FEFCE8',0,'seasonal','Playfair Display','Inter','rounded',null,'12px','filled','centered',144],
    ['Diwali',             'diwali',             'Vibrant Diwali gold and purple',         '#D97706','#7C3AED','#1A0028','#FFFBEB',0,'seasonal','Poppins','Inter','rounded',null,'16px','filled','centered',145],

    // ── INDUSTRY-SPECIFIC ────────────────────────────────────────────────────
    ['Medical',            'medical',            'Clean medical blue and white',           '#0369A1','#0EA5E9','#F0F9FF','#0C4A6E',0,'industry','Inter','Inter','rounded',null,'8px','filled','left',146],
    ['Legal',              'legal',              'Authoritative legal navy',               '#1E3A5F','#1D4ED8','#FFFFFF','#1E3A5F',0,'industry','Merriweather','Merriweather','flat',null,'4px','filled','left',147],
    ['Finance',            'finance',            'Professional finance green',             '#166534','#16A34A','#F0FDF4','#052E16',0,'industry','Inter','Inter','flat',null,'4px','filled','left',148],
    ['Real Estate',        'real-estate',        'Trustworthy real estate blue',           '#1D4ED8','#2563EB','#EFF6FF','#1E3A5F',0,'industry','Merriweather','Inter','rounded',null,'6px','filled','left',149],
    ['Creative Agency',    'creative-agency',    'Bold creative agency',                   '#7C3AED','#EC4899','#FAF5FF','#1A0028',0,'industry','Space Grotesk','Inter','rounded',null,'16px','filled','centered',150],
    ['Restaurant',         'restaurant',         'Warm restaurant red and cream',          '#B91C1C','#DC2626','#FEF3C7','#1A0000',0,'industry','Playfair Display','Lora','rounded',null,'8px','filled','centered',151],
    ['Fitness',            'fitness',            'Energetic fitness orange',               '#EA580C','#F97316','#09090B','#FFF7ED',0,'industry','Space Grotesk','Inter','rounded',null,'8px','filled','centered',152],
    ['Education',          'education',          'Friendly education blue',                '#2563EB','#3B82F6','#EFF6FF','#1E3A5F',0,'industry','Poppins','Inter','rounded',null,'12px','filled','centered',153],
    ['Photography',        'photography',        'Minimal photography black',              '#1F2937','#374151','#FFFFFF','#111827',0,'industry','Playfair Display','Inter','flat',null,'0px','filled','centered',154],
    ['Music',              'music',              'Dark music industry',                    '#7C3AED','#A855F7','#09090B','#FAF5FF',0,'industry','Space Grotesk','Inter','rounded',null,'12px','filled','centered',155],
    ['Fashion',            'fashion',            'Elegant fashion black',                  '#000000','#374151','#FFFFFF','#000000',0,'industry','Playfair Display','Lora','flat',null,'0px','filled','centered',156],
    ['Tech Startup',       'tech-startup',       'Modern tech startup',                    '#6366F1','#8B5CF6','#EEF2FF','#1E1B4B',0,'industry','Space Grotesk','Inter','rounded',null,'12px','filled','centered',157],
    ['Healthcare',         'healthcare',         'Caring healthcare teal',                 '#0F766E','#0D9488','#F0FDFA','#042F2E',0,'industry','Inter','Inter','rounded',null,'8px','filled','left',158],
    ['Consulting',         'consulting',         'Premium consulting navy',                '#1E3A5F','#2563EB','#F8FAFC','#0F172A',0,'industry','Merriweather','Inter','flat',null,'4px','filled','left',159],
    ['Architecture',       'architecture',       'Minimal architecture grey',              '#374151','#6B7280','#F9FAFB','#111827',0,'industry','Space Grotesk','Inter','flat',null,'0px','outline','left',160],

    // ── CULTURAL ─────────────────────────────────────────────────────────────
    ['Japanese Zen',       'japanese-zen',       'Minimalist Japanese zen',                '#DC2626','#EF4444','#FAFAFA','#111827',0,'cultural','Merriweather','Merriweather','flat',null,'0px','filled','centered',161],
    ['Scandinavian',       'scandinavian',       'Clean Scandinavian design',              '#374151','#6B7280','#FAFAFA','#111827',0,'cultural','Inter','Inter','flat',null,'0px','outline','centered',162],
    ['Mediterranean',      'mediterranean',      'Warm Mediterranean blue',                '#0369A1','#0EA5E9','#FFFBEB','#0C4A6E',0,'cultural','Lora','Lora','rounded',null,'8px','filled','centered',163],
    ['African Sunset',     'african-sunset',     'Vibrant African sunset',                 '#EA580C','#D97706','#FFF7ED','#1C0A00',0,'cultural','Poppins','Inter','rounded',null,'12px','filled','centered',164],
    ['Nordic',             'nordic',             'Cool Nordic blues',                      '#0369A1','#0EA5E9','#F0F9FF','#0C4A6E',0,'cultural','Inter','Inter','flat',null,'4px','filled','centered',165],
    ['Bohemian',           'bohemian',           'Free-spirited bohemian',                 '#B45309','#D97706','#FEF3C7','#1C1917',0,'cultural','Lora','Lora','rounded',null,'12px','filled','centered',166],
    ['Tropical Island',    'tropical-island',    'Tropical island vibes',                  '#0D9488','#F97316','#ECFDF5','#042F2E',0,'cultural','Poppins','Inter','rounded',null,'16px','filled','centered',167],
    ['Parisian',           'parisian',           'Elegant Parisian style',                 '#1F2937','#374151','#FFFBEB','#111827',0,'cultural','Playfair Display','Lora','flat',null,'0px','filled','centered',168],
    ['Moroccan',           'moroccan',           'Rich Moroccan colours',                  '#B45309','#7C3AED','#FEF3C7','#1C1917',0,'cultural','Lora','Lora','rounded',null,'12px','filled','centered',169],
    ['British Classic',    'british-classic',    'Classic British navy and red',           '#1E3A5F','#DC2626','#FFFFFF','#1E3A5F',0,'cultural','Merriweather','Merriweather','flat',null,'4px','filled','left',170],

    // ── SOCIAL MEDIA INSPIRED ────────────────────────────────────────────────
    ['Instagram',          'instagram',          'Instagram gradient inspired',            '#E1306C','#F77737','#FDF2F8','#1A0028',0,'social','Inter','Inter','rounded','linear-gradient(135deg,#FCE7F3,#FED7AA)','16px','filled','centered',171],
    ['LinkedIn',           'linkedin',           'LinkedIn professional blue',             '#0A66C2','#0077B5','#EFF6FF','#1E3A5F',0,'social','Inter','Inter','rounded',null,'8px','filled','left',172],
    ['Twitter/X',          'twitter-x',          'Twitter/X dark theme',                  '#1DA1F2','#60A5FA','#000000','#FFFFFF',0,'social','Inter','Inter','rounded',null,'20px','filled','centered',173],
    ['TikTok',             'tiktok',             'TikTok dark with neon',                  '#FF0050','#00F2EA','#010101','#FFFFFF',0,'social','Space Grotesk','Inter','rounded',null,'12px','filled','centered',174],
    ['YouTube',            'youtube',            'YouTube red and dark',                   '#FF0000','#CC0000','#0F0F0F','#FFFFFF',0,'social','Roboto','Inter','rounded',null,'4px','filled','centered',175],
    ['Spotify',            'spotify',            'Spotify green on dark',                  '#1DB954','#1ED760','#121212','#FFFFFF',0,'social','Space Grotesk','Inter','rounded',null,'20px','filled','centered',176],
    ['Discord',            'discord',            'Discord blurple dark',                   '#5865F2','#7289DA','#36393F','#FFFFFF',0,'social','Inter','Inter','rounded',null,'8px','filled','centered',177],
    ['Twitch',             'twitch',             'Twitch purple dark',                     '#9146FF','#A970FF','#0E0E10','#EFEFF1',0,'social','Inter','Inter','rounded',null,'8px','filled','centered',178],
    ['Pinterest',          'pinterest',          'Pinterest red and white',                '#E60023','#AD081B','#FFFFFF','#111111',0,'social','Inter','Inter','rounded',null,'16px','filled','centered',179],
    ['Behance',            'behance',            'Behance blue professional',              '#1769FF','#0057FF','#FFFFFF','#1A1A1A',0,'social','Inter','Inter','flat',null,'4px','filled','centered',180],

    // ── GLASS / FROSTED ──────────────────────────────────────────────────────
    ['Frosted Blue',       'frosted-blue',       'Frosted glass blue',                     '#3B82F6','#60A5FA','#EFF6FF','#1E3A5F',0,'glass','Inter','Inter','rounded','linear-gradient(135deg,#DBEAFE,#EFF6FF)','16px','filled','centered',181],
    ['Frosted Purple',     'frosted-purple',     'Frosted glass purple',                   '#8B5CF6','#A78BFA','#FAF5FF','#1A0028',0,'glass','Inter','Inter','rounded','linear-gradient(135deg,#EDE9FE,#FAF5FF)','16px','filled','centered',182],
    ['Frosted Rose',       'frosted-rose',       'Frosted glass rose',                     '#F43F5E','#FB7185','#FFF1F2','#1C0A0A',0,'glass','Inter','Inter','rounded','linear-gradient(135deg,#FFE4E6,#FFF1F2)','16px','filled','centered',183],
    ['Frosted Teal',       'frosted-teal',       'Frosted glass teal',                     '#0D9488','#2DD4BF','#F0FDFA','#042F2E',0,'glass','Inter','Inter','rounded','linear-gradient(135deg,#CCFBF1,#F0FDFA)','16px','filled','centered',184],
    ['Frosted Dark',       'frosted-dark',       'Frosted dark glass',                     '#6366F1','#818CF8','#0F0F2E','#F5F3FF',0,'glass','Inter','Inter','rounded','linear-gradient(135deg,#0F0F2E,#1A0028)','16px','filled','centered',185],

    // ── NEON ─────────────────────────────────────────────────────────────────
    ['Neon Pink',          'neon-pink',          'Neon pink on black',                     '#FF006E','#FF4DA6','#09090B','#FF006E',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',186],
    ['Neon Blue',          'neon-blue',          'Neon blue on black',                     '#00D4FF','#38BDF8','#09090B','#00D4FF',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',187],
    ['Neon Yellow',        'neon-yellow',        'Neon yellow on black',                   '#FFE600','#FDE047','#09090B','#FFE600',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',188],
    ['Neon Orange',        'neon-orange',        'Neon orange on black',                   '#FF6B00','#F97316','#09090B','#FF6B00',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',189],
    ['Neon Purple',        'neon-purple',        'Neon purple on black',                   '#BF00FF','#A855F7','#09090B','#BF00FF',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',190],
    ['Neon Green Dark',    'neon-green-dark',    'Neon green on dark',                     '#00FF41','#4ADE80','#0A0A0A','#00FF41',0,'neon','Space Grotesk','Space Grotesk','flat',null,'0px','filled','centered',191],
    ['Neon Cyan',          'neon-cyan',          'Neon cyan on dark',                      '#00FFFF','#22D3EE','#0A0A0A','#00FFFF',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',192],
    ['Neon Red',           'neon-red',           'Neon red on black',                      '#FF0000','#EF4444','#09090B','#FF0000',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',193],
    ['Neon Multicolor',    'neon-multicolor',    'Multicolor neon on dark',                '#FF006E','#00D4FF','#09090B','#FF006E',0,'neon','Space Grotesk','Inter','rounded','linear-gradient(135deg,#09090B,#0D0D1A)','12px','filled','centered',194],
    ['Neon Lime',          'neon-lime',          'Neon lime on dark',                      '#A3E635','#BEF264','#0A0A0A','#A3E635',0,'neon','Space Grotesk','Inter','rounded',null,'8px','filled','centered',195],

    // ── EARTH TONES ──────────────────────────────────────────────────────────
    ['Clay',               'clay',               'Warm clay earth tones',                  '#C2410C','#EA580C','#FFF7ED','#1C0A00',0,'earth','Lora','Lora','rounded',null,'8px','filled','centered',196],
    ['Walnut',             'walnut',             'Rich walnut brown',                      '#78350F','#92400E','#FEF3C7','#1C1917',0,'earth','Merriweather','Merriweather','rounded',null,'6px','filled','centered',197],
    ['Rust',               'rust',               'Rusty iron earth tone',                  '#B91C1C','#C2410C','#FFF7ED','#1A0000',0,'earth','Lora','Inter','rounded',null,'8px','filled','centered',198],
    ['Sienna',             'sienna',             'Warm sienna earth',                      '#A16207','#B45309','#FFFBEB','#1C1917',0,'earth','Merriweather','Merriweather','rounded',null,'8px','filled','centered',199],
    ['Olive',              'olive',              'Earthy olive green',                     '#4D7C0F','#65A30D','#F7FEE7','#1A2E05',0,'earth','Lora','Inter','rounded',null,'8px','filled','centered',200],
    ['Umber',              'umber',              'Deep umber brown',                       '#78350F','#92400E','#FEF3C7','#1C1917',0,'earth','Merriweather','Lora','rounded',null,'6px','filled','centered',201],
    ['Ochre',              'ochre',              'Golden ochre earth',                     '#B45309','#D97706','#FFFBEB','#1C1917',0,'earth','Lora','Lora','rounded',null,'8px','filled','centered',202],
    ['Dune',               'dune',               'Sandy dune beige',                       '#A16207','#CA8A04','#FEFCE8','#1A1A00',0,'earth','Merriweather','Inter','rounded',null,'8px','filled','centered',203],
    ['Bark',               'bark',               'Tree bark brown',                        '#78350F','#92400E','#FEF3C7','#1C1917',0,'earth','Lora','Lora','rounded',null,'6px','filled','centered',204],
    ['Flint',              'flint',              'Grey flint stone',                       '#374151','#6B7280','#F9FAFB','#111827',0,'earth','Inter','Inter','rounded',null,'4px','filled','centered',205],

    // ── WATERCOLOUR ──────────────────────────────────────────────────────────
    ['Watercolour Blue',   'watercolour-blue',   'Soft watercolour blue wash',             '#0EA5E9','#38BDF8','#F0F9FF','#0C4A6E',0,'watercolour','Lora','Lora','rounded','linear-gradient(135deg,#BAE6FD,#E0F2FE)','20px','filled','centered',206],
    ['Watercolour Pink',   'watercolour-pink',   'Soft watercolour pink wash',             '#EC4899','#F472B6','#FDF2F8','#1A0028',0,'watercolour','Lora','Lora','rounded','linear-gradient(135deg,#FCE7F3,#FDF2F8)','20px','filled','centered',207],
    ['Watercolour Green',  'watercolour-green',  'Soft watercolour green wash',            '#16A34A','#4ADE80','#F0FDF4','#052E16',0,'watercolour','Lora','Lora','rounded','linear-gradient(135deg,#DCFCE7,#F0FDF4)','20px','filled','centered',208],
    ['Watercolour Purple', 'watercolour-purple', 'Soft watercolour purple wash',           '#8B5CF6','#A78BFA','#FAF5FF','#1A0028',0,'watercolour','Lora','Lora','rounded','linear-gradient(135deg,#EDE9FE,#FAF5FF)','20px','filled','centered',209],
    ['Watercolour Amber',  'watercolour-amber',  'Soft watercolour amber wash',            '#D97706','#F59E0B','#FFFBEB','#1C1917',0,'watercolour','Lora','Lora','rounded','linear-gradient(135deg,#FEF3C7,#FFFBEB)','20px','filled','centered',210],

    // ── TYPOGRAPHY-FOCUSED ───────────────────────────────────────────────────
    ['Editorial',          'editorial',          'Editorial serif typography',             '#1F2937','#374151','#FAFAFA','#111827',0,'typography','Playfair Display','Lora','flat',null,'0px','filled','left',211],
    ['Magazine',           'magazine',           'Bold magazine layout',                   '#DC2626','#EF4444','#FFFFFF','#111827',0,'typography','Playfair Display','Inter','flat',null,'0px','filled','left',212],
    ['Newspaper',          'newspaper',          'Classic newspaper black',                '#111827','#374151','#FFFFFF','#111827',0,'typography','Merriweather','Merriweather','flat',null,'0px','filled','left',213],
    ['Book',               'book',               'Classic book typography',                '#1F2937','#374151','#FFFBEB','#111827',0,'typography','Merriweather','Merriweather','flat',null,'0px','filled','left',214],
    ['Poster',             'poster',             'Bold poster typography',                 '#000000','#1F2937','#FFFFFF','#000000',0,'typography','Space Grotesk','Space Grotesk','flat',null,'0px','filled','centered',215],
    ['Handwritten',        'handwritten',        'Casual handwritten feel',                '#7C3AED','#8B5CF6','#FAF5FF','#1A0028',0,'typography','Lora','Lora','rounded',null,'16px','filled','centered',216],
    ['Mono Type',          'mono-type',          'Monospace typewriter',                   '#1F2937','#374151','#F9F6EE','#1F2937',0,'typography','Space Grotesk','Space Grotesk','flat',null,'0px','outline','left',217],
    ['Script',             'script',             'Elegant script feel',                    '#92400E','#B45309','#FFFBEB','#1C1917',0,'typography','Playfair Display','Lora','rounded',null,'12px','filled','centered',218],
    ['Sans Modern',        'sans-modern',        'Clean modern sans-serif',                '#0F172A','#1E293B','#FFFFFF','#0F172A',0,'typography','DM Sans','DM Sans','rounded',null,'8px','filled','centered',219],
    ['Geometric',          'geometric',          'Geometric bold type',                    '#6366F1','#818CF8','#EEF2FF','#1E1B4B',0,'typography','Space Grotesk','Space Grotesk','rounded',null,'12px','filled','centered',220],

    // ── ADDITIONAL VARIETY ───────────────────────────────────────────────────
    ['Cobalt',             'cobalt',             'Deep cobalt blue',                       '#1D4ED8','#2563EB','#EFF6FF','#1E3A5F',0,'bold','Inter','Inter','rounded',null,'10px','filled','centered',221],
    ['Vermillion',         'vermillion',         'Vivid vermillion red',                   '#DC2626','#EF4444','#FEF2F2','#1A0000',0,'bold','Space Grotesk','Inter','rounded',null,'10px','filled','centered',222],
    ['Cerulean',           'cerulean',           'Bright cerulean sky blue',               '#0284C7','#0EA5E9','#F0F9FF','#0C4A6E',0,'nature','Inter','Inter','rounded',null,'12px','filled','centered',223],
    ['Viridian',           'viridian',           'Deep viridian green',                    '#065F46','#059669','#ECFDF5','#022C22',0,'nature','Inter','Inter','rounded',null,'10px','filled','centered',224],
    ['Fuchsia',            'fuchsia',            'Vivid fuchsia pink',                     '#C026D3','#D946EF','#FDF4FF','#1A0028',0,'creative','Space Grotesk','Inter','rounded',null,'16px','filled','centered',225],
    ['Tangerine',          'tangerine',          'Bright tangerine orange',                '#EA580C','#F97316','#FFF7ED','#1C0A00',0,'creative','Poppins','Inter','rounded',null,'16px','filled','centered',226],
    ['Periwinkle',         'periwinkle',         'Soft periwinkle blue-purple',            '#818CF8','#A5B4FC','#EEF2FF','#1E1B4B',0,'pastel','Poppins','Inter','rounded',null,'20px','filled','centered',227],
    ['Mauve',              'mauve',              'Dusty mauve purple',                     '#9F7AEA','#B794F4','#FAF5FF','#1A0028',0,'pastel','Lora','Lora','rounded',null,'16px','filled','centered',228],
    ['Dusty Rose',         'dusty-rose',         'Dusty rose vintage pink',                '#E11D48','#FB7185','#FFF1F2','#1C0A0A',0,'pastel','Lora','Lora','rounded',null,'16px','filled','centered',229],
    ['Seafoam',            'seafoam',            'Soft seafoam green',                     '#0D9488','#2DD4BF','#F0FDFA','#042F2E',0,'pastel','DM Sans','DM Sans','rounded',null,'16px','filled','centered',230],
    ['Bluebell',           'bluebell',           'Delicate bluebell blue',                 '#3B82F6','#93C5FD','#EFF6FF','#1E3A5F',0,'pastel','Lora','Lora','rounded',null,'20px','filled','centered',231],
    ['Wisteria',           'wisteria',           'Soft wisteria purple',                   '#7C3AED','#C4B5FD','#FAF5FF','#1A0028',0,'pastel','Lora','Lora','rounded',null,'20px','filled','centered',232],
    ['Carnation',          'carnation',          'Bright carnation pink',                  '#F43F5E','#FDA4AF','#FFF1F2','#1C0A0A',0,'pastel','Poppins','Inter','rounded',null,'20px','filled','centered',233],
    ['Daffodil',           'daffodil',           'Bright daffodil yellow',                 '#EAB308','#FDE047','#FEFCE8','#1A1A00',0,'pastel','Poppins','Inter','rounded',null,'16px','filled','centered',234],
    ['Hyacinth',           'hyacinth',           'Deep hyacinth purple',                   '#6D28D9','#8B5CF6','#FAF5FF','#1A0028',0,'pastel','Lora','Lora','rounded',null,'16px','filled','centered',235],
    ['Iris',               'iris',               'Elegant iris purple-blue',               '#4F46E5','#6366F1','#EEF2FF','#1E1B4B',0,'pastel','Lora','Lora','rounded',null,'16px','filled','centered',236],
    ['Poppy',              'poppy',              'Vivid poppy red',                        '#DC2626','#F87171','#FEF2F2','#1A0000',0,'nature','Poppins','Inter','rounded',null,'16px','filled','centered',237],
    ['Sunflower',          'sunflower',          'Bright sunflower yellow',                '#CA8A04','#EAB308','#FEFCE8','#1A1A00',0,'nature','Poppins','Inter','rounded',null,'16px','filled','centered',238],
    ['Dahlia',             'dahlia',             'Rich dahlia purple',                     '#9F1239','#E11D48','#FFF1F2','#1C0A0A',0,'nature','Playfair Display','Lora','rounded',null,'16px','filled','centered',239],
    ['Magnolia',           'magnolia',           'Soft magnolia cream',                    '#D97706','#F59E0B','#FFFBEB','#1C1917',0,'nature','Playfair Display','Lora','rounded',null,'12px','filled','centered',240],
    ['Violet',             'violet',             'Deep violet purple',                     '#7C3AED','#8B5CF6','#FAF5FF','#1A0028',0,'nature','Lora','Lora','rounded',null,'12px','filled','centered',241],
    ['Indigo',             'indigo',             'Rich indigo blue',                       '#4338CA','#4F46E5','#EEF2FF','#1E1B4B',0,'nature','Inter','Inter','rounded',null,'12px','filled','centered',242],
    ['Crimson',            'crimson',            'Deep crimson red',                       '#9F1239','#BE123C','#FFF1F2','#1C0A0A',0,'nature','Merriweather','Inter','rounded',null,'10px','filled','centered',243],
    ['Scarlet',            'scarlet',            'Vivid scarlet red',                      '#DC2626','#EF4444','#FEF2F2','#1A0000',0,'bold','Space Grotesk','Inter','rounded',null,'10px','filled','centered',244],
    ['Maroon',             'maroon',             'Deep maroon red',                        '#7F1D1D','#991B1B','#FEF2F2','#1A0000',0,'professional','Merriweather','Inter','rounded',null,'8px','filled','centered',245],
    ['Teal',               'teal',               'Classic teal blue-green',                '#0F766E','#0D9488','#F0FDFA','#042F2E',0,'nature','Inter','Inter','rounded',null,'10px','filled','centered',246],
    ['Cyan',               'cyan',               'Bright cyan blue',                       '#0891B2','#06B6D4','#ECFEFF','#083344',0,'creative','Space Grotesk','Inter','rounded',null,'12px','filled','centered',247],
    ['Magenta',            'magenta',            'Vivid magenta pink',                     '#C026D3','#D946EF','#FDF4FF','#1A0028',0,'creative','Space Grotesk','Inter','rounded',null,'12px','filled','centered',248],
    ['Chartreuse',         'chartreuse',         'Vivid chartreuse green',                 '#65A30D','#84CC16','#F7FEE7','#1A2E05',0,'creative','Space Grotesk','Inter','rounded',null,'12px','filled','centered',249],
    ['Turquoise',          'turquoise',          'Bright turquoise',                       '#0D9488','#14B8A6','#F0FDFA','#042F2E',0,'nature','Inter','Inter','rounded',null,'12px','filled','centered',250],
  ];

  for (const t of themes) {
    try { insertTheme.run(...t); } catch { /* skip duplicates */ }
  }
}

// Seed admin settings
const settingCount = (db.prepare('SELECT COUNT(*) as c FROM admin_settings').get() as { c: number }).c;
if (settingCount === 0) {
  const insertSetting = db.prepare('INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)');
  insertSetting.run('site_name', 'JA Smart Profile');
  insertSetting.run('site_tagline', 'Your digital business card, reimagined.');
  insertSetting.run('allow_registration', 'true');
  insertSetting.run('maintenance_mode', 'false');
}

// Seed branding settings (idempotent — INSERT OR IGNORE)
const brandingDefaults: [string, string][] = [
  ['platform_name', 'JA Smart Profile'],
  ['platform_tagline', 'Your digital business card, reimagined.'],
  ['platform_description', 'Create a stunning digital profile that showcases who you are and what you do — share it with a single link.'],
  ['platform_url', 'https://jasmartprofile.jagroupservices.co.uk'],
  ['master_brand_name', 'JA Group Services'],
  ['master_brand_url', 'https://jagroupservices.co.uk'],
  ['legal_company_name', 'JA Group Services Ltd'],
  ['legal_company_number', ''],
  ['legal_registered_address', ''],
  ['legal_vat_number', ''],
  ['legal_email', 'legal@jagroupservices.co.uk'],
  ['legal_privacy_email', 'privacy@jagroupservices.co.uk'],
  ['support_email', 'jasmartprofile@jagroupservices.co.uk'],
  ['contact_email', 'jasmartprofile@jagroupservices.co.uk'],
  ['footer_tagline', 'Part of JA Group Services'],
  ['footer_show_legal_name', '1'],
  ['social_twitter', ''],
  ['social_linkedin', ''],
  ['social_instagram', ''],
  ['social_facebook', ''],
  ['email_from_name', 'JA Smart Profile'],
];
const upsertBranding = db.prepare('INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)');
for (const [k, v] of brandingDefaults) upsertBranding.run(k, v);

// ── Domain / email corrections ──────────────────────────────────────────────
// Force-correct any stale values that may exist in the live DB from earlier
// seeds that used the wrong domain. INSERT OR IGNORE above won't overwrite
// existing rows, so we UPDATE explicitly for the fields that changed.
const correctValues: [string, string][] = [
  ['support_email',  'jasmartprofile@jagroupservices.co.uk'],
  ['contact_email',  'jasmartprofile@jagroupservices.co.uk'],
  ['legal_email',    'jasmartprofile@jagroupservices.co.uk'],
  ['platform_url',   'https://jasmartprofile.jagroupservices.co.uk'],
];
const fixBranding = db.prepare('UPDATE admin_settings SET value = ? WHERE key = ? AND value != ?');
for (const [k, v] of correctValues) fixBranding.run(v, k, v);

// ── Referral & Points system ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS referral_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS referral_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'signup',
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS points_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ref_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.exec('CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes (user_id)'); } catch { /* exists */ }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON referral_events (referrer_user_id)'); } catch { /* exists */ }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON points_ledger (user_id)'); } catch { /* exists */ }

// ── Late-created tables (created by API handlers previously — moved here for safety) ──
// These are idempotent; safe to run on every boot.
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
  );

  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email TEXT NOT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status TEXT DEFAULT 'pending'
  );
`);

// ── Card Messaging system ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS card_message_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS card_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL REFERENCES card_message_threads(id) ON DELETE CASCADE,
    sender TEXT NOT NULL DEFAULT 'visitor',
    body TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_card_threads_profile ON card_message_threads (profile_id)'); } catch { /* exists */ }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_card_messages_thread ON card_messages (thread_id)'); } catch { /* exists */ }

// ── Affiliate programme tables ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS affiliate_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    audience TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    commission_rate REAL DEFAULT 10.0,
    affiliate_code TEXT UNIQUE,
    approved_at DATETIME,
    rejected_at DATETIME,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id INTEGER NOT NULL REFERENCES affiliate_applications(id) ON DELETE CASCADE,
    referred_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT,
    plan_name TEXT,
    amount_gbp REAL NOT NULL DEFAULT 0,
    commission_gbp REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
try { db.exec('CREATE INDEX IF NOT EXISTS idx_affiliate_apps_user ON affiliate_applications (user_id)'); } catch { /* exists */ }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_affiliate_apps_code ON affiliate_applications (affiliate_code)'); } catch { /* exists */ }
try { db.exec('CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions (affiliate_id)'); } catch { /* exists */ }

// ── UK GDPR migrations ──────────────────────────────────────────────────────
// page_views: drop raw user_agent (PII), keep only hashed IP
runMigration('ALTER TABLE page_views ADD COLUMN ip_hash_v2 TEXT');
// contact_enquiries: add consent timestamp (PECR / UK GDPR Art 7)
runMigration('ALTER TABLE contact_enquiries ADD COLUMN consent_given_at DATETIME');
// partner_enquiries: add consent timestamp
runMigration('ALTER TABLE partner_enquiries ADD COLUMN consent_given_at DATETIME');
// support_requests: add consent timestamp
runMigration('ALTER TABLE support_requests ADD COLUMN consent_given_at DATETIME');

// ── Site theme / appearance settings ────────────────────────────────────────
// Seeded idempotently; admin can override via Settings → Appearance tab.
const themeDefaults: [string, string][] = [
  ['site_color_mode', 'dark'],          // 'light' | 'dark'
  ['site_primary_color', '#3B82F6'],    // hex
  ['site_secondary_color', '#513bf6'],  // hex
  ['site_accent_color', '#3B82F6'],     // hex
];
const upsertTheme = db.prepare('INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)');
for (const [k, v] of themeDefaults) upsertTheme.run(k, v);

// NOTE: No fake/demo admin or customer users are seeded in production.
// Admin access is via Microsoft Entra OIDC (workforce tenant) only.
// Customer access is via Microsoft Entra External ID (CIAM) only.

export default db;
