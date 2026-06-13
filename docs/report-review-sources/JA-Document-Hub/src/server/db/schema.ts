import {
  mysqlTable, int, varchar, timestamp, text,
  boolean, mysqlEnum,
} from 'drizzle-orm/mysql-core';

// ── Customer accounts ─────────────────────────────────────────────────────────
export const ja_users = mysqlTable('ja_users', {
  id:            int('id').primaryKey().autoincrement(),
  uuid:          varchar('uuid', { length: 36 }).notNull().unique(),

  // ── Microsoft Entra identity ──────────────────────────────────────────────
  oidcSub:       varchar('oidc_sub', { length: 255 }),        // Entra object ID (sub claim) — primary link key
  tenantId:      varchar('tenant_id', { length: 255 }),       // Entra tenant ID (tid claim)
  authMethod:    mysqlEnum('auth_method', ['oidc', 'password', 'both']).notNull().default('oidc'),

  // ── Profile ───────────────────────────────────────────────────────────────
  email:         varchar('email', { length: 255 }).notNull().unique(),
  displayName:   varchar('display_name', { length: 255 }),    // Full name from Entra (name claim)
  firstName:     varchar('first_name', { length: 100 }).notNull(),
  lastName:      varchar('last_name', { length: 100 }).notNull(),
  company:       varchar('company', { length: 255 }),
  photoUrl:      text('photo_url'),                           // Profile photo URL from Entra (if available)

  // ── App permissions ───────────────────────────────────────────────────────
  role:          mysqlEnum('role', ['user', 'manager', 'admin']).notNull().default('user'),
  accountStatus: mysqlEnum('account_status', ['active', 'suspended', 'pending']).notNull().default('active'),

  // ── Legacy / billing ──────────────────────────────────────────────────────
  passwordHash:  varchar('password_hash', { length: 255 }).notNull().default(''),
  plan:          mysqlEnum('plan', ['free', 'personal', 'standard', 'professional', 'org_starter', 'org_growth', 'org_professional']).notNull().default('free'),
  orgId:         int('org_id'),
  usageType:     mysqlEnum('usage_type', ['personal', 'business', 'both']).default('both'),
  isVerified:    boolean('is_verified').notNull().default(false),
  planIsLifetime: boolean('plan_is_lifetime').notNull().default(false),
  planExpiresAt:  timestamp('plan_expires_at'),

  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
  lastLogin:     timestamp('last_login'),
});

// ── Customer sessions ─────────────────────────────────────────────────────────
export const ja_sessions = mysqlTable('ja_sessions', {
  id:        int('id').primaryKey().autoincrement(),
  token:     varchar('token', { length: 128 }).notNull().unique(),
  userId:    int('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// ── Saved documents ───────────────────────────────────────────────────────────
export const ja_documents = mysqlTable('ja_documents', {
  id:         int('id').primaryKey().autoincrement(),
  uuid:       varchar('uuid', { length: 36 }).notNull().unique(),
  userId:     int('user_id').notNull(),
  templateId: varchar('template_id', { length: 100 }).notNull(),
  title:      varchar('title', { length: 255 }).notNull(),
  category:   varchar('category', { length: 100 }),
  status:     mysqlEnum('status', ['draft', 'complete', 'archived']).notNull().default('draft'),
  docRef:     varchar('doc_ref', { length: 30 }),
  fields:     text('fields'),   // JSON string
  content:    text('content'),  // HTML string
  version:    int('version').notNull().default(1),
  folderId:   varchar('folder_id', { length: 36 }),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
  expiresAt:  timestamp('expires_at'),   // auto-delete after retention period
});

// ── Document folders ──────────────────────────────────────────────────────────
export const ja_folders = mysqlTable('ja_folders', {
  id:        int('id').primaryKey().autoincrement(),
  uuid:      varchar('uuid', { length: 36 }).notNull().unique(),
  userId:    int('user_id').notNull(),
  name:      varchar('name', { length: 255 }).notNull(),
  color:     varchar('color', { length: 30 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Admin accounts ────────────────────────────────────────────────────────────
export const ja_admin_accounts = mysqlTable('ja_admin_accounts', {
  id:                        int('id').primaryKey().autoincrement(),
  uuid:                      varchar('uuid', { length: 36 }).notNull().unique(),
  name:                      varchar('name', { length: 255 }).notNull(),
  email:                     varchar('email', { length: 255 }).notNull().unique(),
  passwordHash:              varchar('password_hash', { length: 255 }).notNull(),
  role:                      varchar('role', { length: 60 }).notNull(),
  isPlatformOwner:           boolean('is_platform_owner').notNull().default(false),
  isSystemAdministrator:     boolean('is_system_administrator').notNull().default(false),
  isPublicRegistrationAllowed: boolean('is_public_registration_allowed').notNull().default(false),
  isVerified:                boolean('is_verified').notNull().default(true),
  mustResetPassword:         boolean('must_reset_password').notNull().default(false),
  suspended:                 boolean('suspended').notNull().default(false),
  createdAt:                 timestamp('created_at').defaultNow().notNull(),
  lastLogin:                 timestamp('last_login'),
});

// ── Admin sessions ────────────────────────────────────────────────────────────
// adminId is kept for backward-compat but is nullable — Microsoft identity is
// the source of truth, stored in msEmail / msName / msRoles.
export const ja_admin_sessions = mysqlTable('ja_admin_sessions', {
  id:        int('id').primaryKey().autoincrement(),
  token:     varchar('token', { length: 128 }).notNull().unique(),
  adminId:   int('admin_id'),                                       // nullable — legacy
  msEmail:   varchar('ms_email', { length: 255 }),                  // Microsoft UPN/email
  msName:    varchar('ms_name', { length: 255 }),                   // Microsoft display name
  msRoles:   varchar('ms_roles', { length: 1000 }),                 // JSON array of app roles
  msTid:     varchar('ms_tid', { length: 64 }),                     // Microsoft tenant ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// ── Admin PIN records ─────────────────────────────────────────────────────────
export const ja_admin_pins = mysqlTable('ja_admin_pins', {
  id:        int('id').primaryKey().autoincrement(),
  email:     varchar('email', { length: 255 }).notNull(),
  pin:       varchar('pin', { length: 10 }).notNull(),
  used:      boolean('used').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Admin audit log ───────────────────────────────────────────────────────────
export const ja_admin_audit_log = mysqlTable('ja_admin_audit_log', {
  id:        int('id').primaryKey().autoincrement(),
  email:     varchar('email', { length: 255 }).notNull(),
  success:   boolean('success').notNull(),
  ip:        varchar('ip', { length: 60 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Template favourites ───────────────────────────────────────────────────────
export const ja_favourites = mysqlTable('ja_favourites', {
  id:         int('id').primaryKey().autoincrement(),
  userId:     int('user_id').notNull(),
  templateId: varchar('template_id', { length: 100 }).notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

// ── Recently used templates ───────────────────────────────────────────────────
export const ja_recently_used = mysqlTable('ja_recently_used', {
  id:         int('id').primaryKey().autoincrement(),
  userId:     int('user_id').notNull(),
  templateId: varchar('template_id', { length: 100 }).notNull(),
  usedAt:     timestamp('used_at').defaultNow().notNull(),
});

// ── User notifications ────────────────────────────────────────────────────────
export const ja_notifications = mysqlTable('ja_notifications', {
  id:        int('id').primaryKey().autoincrement(),
  userId:    int('user_id').notNull(),
  type:      varchar('type', { length: 60 }).notNull(),   // 'password_reset' | 'system' | 'plan' | 'document'
  title:     varchar('title', { length: 255 }).notNull(),
  message:   text('message').notNull(),
  read:      boolean('read').notNull().default(false),
  link:      varchar('link', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── User preferences ──────────────────────────────────────────────────────────
export const ja_user_preferences = mysqlTable('ja_user_preferences', {
  id:                    int('id').primaryKey().autoincrement(),
  userId:                int('user_id').notNull().unique(),
  emailNotifications:    boolean('email_notifications').notNull().default(true),
  marketingEmails:       boolean('marketing_emails').notNull().default(false),
  theme:                 varchar('theme', { length: 20 }).notNull().default('system'), // 'light' | 'dark' | 'system'
  updatedAt:             timestamp('updated_at').defaultNow().notNull(),
});

// ── Stripe subscriptions ──────────────────────────────────────────────────────
export const ja_stripe_subscriptions = mysqlTable('ja_stripe_subscriptions', {
  id:                   int('id').primaryKey().autoincrement(),
  userId:               int('user_id').notNull(),
  stripeCustomerId:     varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripePriceId:        varchar('stripe_price_id', { length: 255 }),
  plan:                 mysqlEnum('plan', ['free', 'personal', 'standard', 'professional', 'org_starter', 'org_growth', 'org_professional']).notNull().default('free'),
  status:               varchar('status', { length: 60 }).notNull().default('inactive'),
  // 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'inactive'
  trialStart:           timestamp('trial_start'),
  trialEnd:             timestamp('trial_end'),
  currentPeriodStart:   timestamp('current_period_start'),
  currentPeriodEnd:     timestamp('current_period_end'),
  cancelAtPeriodEnd:    boolean('cancel_at_period_end').notNull().default(false),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:            timestamp('updated_at').defaultNow().notNull(),
});

// ── Password reset requests ───────────────────────────────────────────────────
export const ja_password_reset_requests = mysqlTable('ja_password_reset_requests', {
  id:          int('id').primaryKey().autoincrement(),
  uuid:        varchar('uuid', { length: 36 }).notNull().unique(),
  userId:      int('user_id').notNull(),
  email:       varchar('email', { length: 255 }).notNull(),
  status:      mysqlEnum('status', ['pending', 'approved', 'rejected', 'completed']).notNull().default('pending'),
  token:       varchar('token', { length: 128 }),   // secure reset link token
  pin:         varchar('pin', { length: 10 }),       // secure reset PIN
  deliveryMethod: mysqlEnum('delivery_method', ['link', 'pin']),
  used:        boolean('used').notNull().default(false),
  expiresAt:   timestamp('expires_at'),
  adminNotes:  text('admin_notes'),
  processedBy: varchar('processed_by', { length: 255 }), // admin email
  processedAt: timestamp('processed_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

// ── Support tickets ───────────────────────────────────────────────────────────
export const ja_support_tickets = mysqlTable('ja_support_tickets', {
  id:          int('id').primaryKey().autoincrement(),
  uuid:        varchar('uuid', { length: 36 }).notNull().unique(),
  userId:      int('user_id'),
  name:        varchar('name', { length: 255 }).notNull(),
  email:       varchar('email', { length: 255 }).notNull(),
  subject:     varchar('subject', { length: 500 }).notNull(),
  message:     text('message').notNull(),
  category:    varchar('category', { length: 60 }).notNull().default('general'),
  priority:    mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
  status:      mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).notNull().default('open'),
  adminNotes:  text('admin_notes'),
  resolvedBy:  varchar('resolved_by', { length: 255 }),
  resolvedAt:  timestamp('resolved_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ── System config ─────────────────────────────────────────────────────────────
export const ja_system_config = mysqlTable('ja_system_config', {
  id:        int('id').primaryKey().autoincrement(),
  configKey: varchar('config_key', { length: 100 }).notNull().unique(),
  value:     text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Organisations ─────────────────────────────────────────────────────────────
export const ja_organisations = mysqlTable('ja_organisations', {
  id:           int('id').primaryKey().autoincrement(),
  uuid:         varchar('uuid', { length: 36 }).notNull().unique(),
  name:         varchar('name', { length: 255 }).notNull(),
  plan:         mysqlEnum('plan', ['org_starter', 'org_growth', 'org_professional']).notNull().default('org_starter'),
  ownerUserId:  int('owner_user_id').notNull(),
  maxSeats:     int('max_seats').notNull().default(2),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

// ── Organisation members ──────────────────────────────────────────────────────
export const ja_org_members = mysqlTable('ja_org_members', {
  id:          int('id').primaryKey().autoincrement(),
  orgId:       int('org_id').notNull(),
  userId:      int('user_id').notNull(),
  role:        mysqlEnum('role', ['owner', 'admin', 'manager', 'member', 'read_only']).notNull().default('member'),
  suspended:   boolean('suspended').notNull().default(false),
  suspendedAt: timestamp('suspended_at'),
  suspendedBy: varchar('suspended_by', { length: 255 }),
  invitedBy:   int('invited_by'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

// ── Additional seat purchases ─────────────────────────────────────────────────
export const ja_seat_purchases = mysqlTable('ja_seat_purchases', {
  id:                   int('id').primaryKey().autoincrement(),
  orgId:                int('org_id').notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  seatType:             mysqlEnum('seat_type', ['user', 'manager', 'admin']).notNull().default('user'),
  quantity:             int('quantity').notNull().default(1),
  status:               varchar('status', { length: 60 }).notNull().default('active'),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
});

// ── Lifetime grants audit log ─────────────────────────────────────────────────
export const ja_lifetime_grants = mysqlTable('ja_lifetime_grants', {
  id:        int('id').primaryKey().autoincrement(),
  userId:    int('user_id').notNull(),
  grantedBy: varchar('granted_by', { length: 255 }).notNull(),
  plan:      varchar('plan', { length: 60 }).notNull(),
  action:    mysqlEnum('action', ['grant', 'revoke', 'change']).notNull().default('grant'),
  note:      text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Support ticket messages (admin ↔ customer chat) ──────────────────────────
export const ja_ticket_messages = mysqlTable('ja_ticket_messages', {
  id:         int('id').primaryKey().autoincrement(),
  ticketId:   int('ticket_id').notNull(),
  senderType: mysqlEnum('sender_type', ['admin', 'customer']).notNull(),
  senderId:   int('sender_id'),          // admin_id or user_id (nullable for anonymous)
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  senderEmail: varchar('sender_email', { length: 255 }).notNull(),
  message:    text('message').notNull(),
  readByAdmin: boolean('read_by_admin').notNull().default(false),
  readByCustomer: boolean('read_by_customer').notNull().default(false),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

// ── Admin-created / DB-driven templates ───────────────────────────────────────
export const ja_custom_templates = mysqlTable('ja_custom_templates', {
  id:          int('id').primaryKey().autoincrement(),
  uuid:        varchar('uuid', { length: 36 }).notNull().unique(),
  templateId:  varchar('template_id', { length: 120 }).notNull().unique(),
  name:        varchar('name', { length: 255 }).notNull(),
  category:    varchar('category', { length: 80 }).notNull().default('business'),
  description: text('description').notNull(),
  icon:        varchar('icon', { length: 60 }).notNull().default('FileText'),
  planRequired: mysqlEnum('plan_required', ['free', 'business', 'professional']).notNull().default('free'),
  tags:        text('tags'),          // JSON array string
  sections:    text('sections').notNull(),    // JSON TemplateSections
  generateFn:  text('generate_fn').notNull(), // JS function body
  isActive:    boolean('is_active').notNull().default(true),
  isCustom:    boolean('is_custom').notNull().default(true),
  createdBy:   varchar('created_by', { length: 255 }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ── Builder Documents ─────────────────────────────────────────────────────────
export const ja_builder_docs = mysqlTable('ja_builder_docs', {
  id:         int('id').primaryKey().autoincrement(),
  uuid:       varchar('uuid', { length: 36 }).notNull().unique(),
  userId:     int('user_id').notNull(),
  builderId:  varchar('builder_id', { length: 50 }).notNull(),
  templateId: varchar('template_id', { length: 100 }).notNull(),
  title:      varchar('title', { length: 255 }).notNull(),
  fields:     text('fields').notNull(),   // JSON Record<string,string>
  brandColor: varchar('brand_color', { length: 20 }),
  logoUrl:    text('logo_url'),
  layoutId:   varchar('layout_id', { length: 50 }),
  status:     varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
});
// ── Builder templates (canonical — migrated from static TS files) ─────────────
// This is the single source of truth for all builder templates.
// Seeded from static TS files via scripts/seed-templates-v3.ts.
export const ja_builder_templates = mysqlTable('ja_builder_templates', {
  id:              int('id').primaryKey().autoincrement(),
  templateId:      varchar('template_id', { length: 120 }).notNull(),   // e.g. "letter-formal-business"
  builderId:       varchar('builder_id', { length: 50 }).notNull(),     // e.g. "letter"
  name:            varchar('name', { length: 255 }).notNull(),
  description:     text('description'),
  category:        varchar('category', { length: 100 }).notNull(),
  subcategory:     varchar('subcategory', { length: 100 }),
  industries:      text('industries'),                                   // JSON string[]
  planRequired:    varchar('plan_required', { length: 30 }).notNull().default('free'),
  accessLevel:     varchar('access_level', { length: 30 }).notNull().default('all'),
  orgRestriction:  varchar('org_restriction', { length: 50 }),
  status:          varchar('status', { length: 20 }).notNull().default('active'),
  popular:         boolean('popular').default(false),
  isFeatured:      boolean('is_featured').notNull().default(false),
  isDraft:         boolean('is_draft').notNull().default(false),
  isPublished:     boolean('is_published').notNull().default(true),
  isArchived:      boolean('is_archived').notNull().default(false),
  supportsBranding: boolean('supports_branding').default(false),
  showDocHeader:   boolean('show_doc_header').default(false),
  accentColor:     varchar('accent_color', { length: 20 }),
  defaultLayout:   varchar('default_layout', { length: 60 }),
  bodyTemplate:    text('body_template'),
  fields:          text('fields'),                                       // JSON BuilderField[]
  layoutConfig:    text('layout_config'),                               // JSON layout config
  requiredFields:  text('required_fields'),                             // JSON string[] of required field IDs
  optionalFields:  text('optional_fields'),                             // JSON string[] of optional field IDs
  tags:            text('tags'),                                        // JSON string[]
  sortOrder:       int('sort_order').default(0),
  version:         int('version').notNull().default(1),
  versionNotes:    text('version_notes'),
  thumbnailUrl:    text('thumbnail_url'),
  previewUrl:      text('preview_url'),
  useCount:        int('use_count').notNull().default(0),
  createdBy:       varchar('created_by', { length: 255 }),
  updatedBy:       varchar('updated_by', { length: 255 }),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
});

// ── Builder template overrides (admin edits persisted to DB) ─────────────────
export const ja_builder_template_overrides = mysqlTable('ja_builder_template_overrides', {
  id:           int('id').primaryKey().autoincrement(),
  builderId:    varchar('builder_id', { length: 50 }).notNull(),
  templateId:   varchar('template_id', { length: 120 }).notNull(),
  name:         varchar('name', { length: 255 }),
  description:  text('description'),
  category:     varchar('category', { length: 100 }),
  status:       varchar('status', { length: 20 }),          // active | draft | retired
  planRequired: varchar('plan_required', { length: 30 }),   // personal | standard | professional
  accentColor:  varchar('accent_color', { length: 20 }),
  defaultLayout: varchar('default_layout', { length: 60 }),
  bodyTemplate: text('body_template'),                      // full body template override
  fieldsOverride: text('fields_override'),                  // JSON array of BuilderField overrides
  popular:      boolean('popular'),
  updatedBy:    varchar('updated_by', { length: 255 }),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

// ── Builder meta overrides (admin edits to builder-level name/description/colour) ──
export const ja_builder_meta_overrides = mysqlTable('ja_builder_meta_overrides', {
  id:          int('id').primaryKey().autoincrement(),
  builderId:   varchar('builder_id', { length: 50 }).notNull().unique(),
  label:       varchar('label', { length: 255 }),
  description: text('description'),
  accentColor: varchar('accent_color', { length: 20 }),
  updatedBy:   varchar('updated_by', { length: 255 }),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ── Affiliates ────────────────────────────────────────────────────────────────
export const ja_affiliates = mysqlTable('ja_affiliates', {
  id:              int('id').primaryKey().autoincrement(),
  uuid:            varchar('uuid', { length: 36 }).notNull().unique(),
  userId:          int('user_id'),                                     // linked customer account (if any)
  fullName:        varchar('full_name', { length: 255 }).notNull(),
  email:           varchar('email', { length: 255 }).notNull().unique(),
  phone:           varchar('phone', { length: 60 }),
  company:         varchar('company', { length: 255 }),
  website:         varchar('website', { length: 500 }),
  socialLinks:     text('social_links'),                               // JSON array of strings
  referralMethod:  varchar('referral_method', { length: 255 }),
  expectedAudience: text('expected_audience'),
  referralCode:    varchar('referral_code', { length: 30 }).unique(),
  commissionRate:  int('commission_rate').notNull().default(10),       // percentage, e.g. 10 = 10%
  status:          mysqlEnum('status', ['applied', 'approved', 'rejected', 'suspended']).notNull().default('applied'),
  agreedToTerms:   boolean('agreed_to_terms').notNull().default(false),
  payoutDetails:   text('payout_details'),                             // encrypted/stored securely
  adminNotes:      text('admin_notes'),
  approvedBy:      varchar('approved_by', { length: 255 }),
  approvedAt:      timestamp('approved_at'),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
});

// ── Affiliate referral clicks ─────────────────────────────────────────────────
export const ja_affiliate_clicks = mysqlTable('ja_affiliate_clicks', {
  id:           int('id').primaryKey().autoincrement(),
  affiliateId:  int('affiliate_id').notNull(),
  ipHash:       varchar('ip_hash', { length: 64 }),                    // hashed for privacy
  userAgent:    varchar('user_agent', { length: 500 }),
  landingPage:  varchar('landing_page', { length: 500 }),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

// ── Affiliate conversions ─────────────────────────────────────────────────────
export const ja_affiliate_conversions = mysqlTable('ja_affiliate_conversions', {
  id:           int('id').primaryKey().autoincrement(),
  affiliateId:  int('affiliate_id').notNull(),
  userId:       int('user_id'),                                        // the customer who signed up
  type:         mysqlEnum('type', ['signup', 'subscription']).notNull().default('signup'),
  plan:         varchar('plan', { length: 60 }),
  amountGbp:    int('amount_gbp').notNull().default(0),                // pence
  commissionGbp: int('commission_gbp').notNull().default(0),           // pence
  status:       mysqlEnum('status', ['pending', 'approved', 'paid', 'rejected']).notNull().default('pending'),
  paidAt:       timestamp('paid_at'),
  paidBy:       varchar('paid_by', { length: 255 }),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const ja_invoices = mysqlTable('ja_invoices', {
  id:        int('id').primaryKey().autoincrement(),
  uuid:      varchar('uuid', { length: 36 }).notNull().unique(),
  userId:    int('user_id').notNull(),
  title:     varchar('title', { length: 255 }).notNull(),
  data:      text('data').notNull(),  // JSON InvoiceData
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Document Signing ──────────────────────────────────────────────────────────

export const ja_signing_requests = mysqlTable('ja_signing_requests', {
  id:              int('id').primaryKey().autoincrement(),
  uuid:            varchar('uuid', { length: 36 }).notNull().unique(),
  userId:          int('user_id').notNull(),
  title:           varchar('title', { length: 255 }).notNull(),
  message:         text('message'),                              // optional message to signers
  documentPath:    text('document_path'),                        // stored file path (relative to /shared-storage/public/assets/)
  documentName:    varchar('document_name', { length: 255 }),    // original filename
  documentHash:    varchar('document_hash', { length: 64 }),     // SHA-256 of original document
  status:          mysqlEnum('status', ['draft','sent','viewed','partially_signed','completed','declined','expired','cancelled']).notNull().default('draft'),
  signerOrder:     mysqlEnum('signer_order', ['any','sequential']).notNull().default('any'),
  expiresAt:       timestamp('expires_at'),
  reminderDays:    int('reminder_days').default(3),              // days before expiry to send reminder
  completedAt:     timestamp('completed_at'),
  cancelledAt:     timestamp('cancelled_at'),
  cancelledBy:     int('cancelled_by'),                          // userId or adminId
  certificatePath: text('certificate_path'),                     // audit certificate PDF path
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
});

export const ja_signing_signers = mysqlTable('ja_signing_signers', {
  id:           int('id').primaryKey().autoincrement(),
  uuid:         varchar('uuid', { length: 36 }).notNull().unique(),
  requestId:    int('request_id').notNull(),
  email:        varchar('email', { length: 255 }).notNull(),
  name:         varchar('name', { length: 255 }).notNull(),
  role:         varchar('role', { length: 100 }),                // e.g. "Contractor", "Client"
  order:        int('order').notNull().default(1),               // signing order (1-based)
  status:       mysqlEnum('status', ['pending','sent','viewed','signed','declined']).notNull().default('pending'),
  token:        varchar('token', { length: 128 }).notNull().unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  signedAt:     timestamp('signed_at'),
  declinedAt:   timestamp('declined_at'),
  declineReason: text('decline_reason'),
  ipAddress:    varchar('ip_address', { length: 45 }),
  userAgent:    text('user_agent'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const ja_signing_fields = mysqlTable('ja_signing_fields', {
  id:         int('id').primaryKey().autoincrement(),
  uuid:       varchar('uuid', { length: 36 }).notNull().unique(),
  requestId:  int('request_id').notNull(),
  signerId:   int('signer_id').notNull(),
  fieldType:  mysqlEnum('field_type', ['signature','initials','name','date','checkbox','text','company_name','job_title','email_address','custom']).notNull(),
  page:       int('page').notNull().default(1),
  x:          int('x').notNull().default(0),                     // position % * 1000 (integer to avoid float issues)
  y:          int('y').notNull().default(0),
  width:      int('width').notNull().default(200),
  height:     int('height').notNull().default(60),
  required:   boolean('required').notNull().default(true),
  label:      varchar('label', { length: 100 }),
  value:      text('value'),                                     // filled value (base64 for signature/initials)
  filledAt:   timestamp('filled_at'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

export const ja_signing_audit = mysqlTable('ja_signing_audit', {
  id:          int('id').primaryKey().autoincrement(),
  requestId:   int('request_id').notNull(),
  signerId:    int('signer_id'),                                  // null for owner actions
  userId:      int('user_id'),                                    // null for signer actions
  adminId:     int('admin_id'),                                   // null for non-admin actions
  event:       varchar('event', { length: 100 }).notNull(),       // e.g. 'document_created', 'email_sent'
  detail:      text('detail'),
  ipAddress:   varchar('ip_address', { length: 45 }),
  userAgent:   text('user_agent'),
  signerEmail: varchar('signer_email', { length: 255 }),
  authMethod:  varchar('auth_method', { length: 50 }),            // e.g. 'email_token'
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

export const ja_signing_attachments = mysqlTable('ja_signing_attachments', {
  id:              int('id').primaryKey().autoincrement(),
  uuid:            varchar('uuid', { length: 36 }).notNull().unique(),
  requestId:       int('request_id').notNull(),
  uploadedBy:      int('uploaded_by').notNull(),                  // userId
  filename:        varchar('filename', { length: 255 }).notNull(),
  originalName:    varchar('original_name', { length: 255 }).notNull(),
  mimeType:        varchar('mime_type', { length: 100 }).notNull(),
  fileSize:        int('file_size').notNull(),                    // bytes
  filePath:        text('file_path').notNull(),                   // relative to /shared-storage/public/assets/
  fileHash:        varchar('file_hash', { length: 64 }),          // SHA-256
  visibleToSigners: boolean('visible_to_signers').notNull().default(true),
  appendToFinalPack: boolean('append_to_final_pack').notNull().default(false),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
});

// ── CMS page content blocks ───────────────────────────────────────────────────
// Admin-editable content blocks keyed by slug. Frontend fetches by slug.
// body_html stores rich HTML; body_text is a plain-text fallback/excerpt.
export const ja_page_content = mysqlTable('ja_page_content', {
  id:          int('id').primaryKey().autoincrement(),
  slug:        varchar('slug', { length: 120 }).notNull().unique(),   // e.g. 'homepage-hero'
  title:       varchar('title', { length: 255 }).notNull(),
  type:        varchar('type', { length: 60 }).notNull().default('marketing'), // marketing|legal|help|policy|announcement
  status:      mysqlEnum('status', ['published', 'draft', 'archived']).notNull().default('draft'),
  bodyHtml:    text('body_html'),          // rich HTML — rendered on frontend
  bodyText:    text('body_text'),          // plain text excerpt / fallback
  metaTitle:   varchar('meta_title', { length: 255 }),
  metaDesc:    varchar('meta_desc', { length: 500 }),
  updatedBy:   varchar('updated_by', { length: 255 }).notNull().default('admin'),
  version:     int('version').notNull().default(1),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ── GDPR requests (data export / deletion) — legacy simple table ─────────────
export const ja_gdpr_requests = mysqlTable('ja_gdpr_requests', {
  id:          int('id').primaryKey().autoincrement(),
  userId:      int('user_id').notNull(),
  email:       varchar('email', { length: 255 }).notNull(),
  requestType: mysqlEnum('request_type', ['export', 'deletion']).notNull(),
  reason:      text('reason'),
  status:      mysqlEnum('status', ['pending', 'processing', 'completed', 'rejected']).notNull().default('pending'),
  processedBy: varchar('processed_by', { length: 255 }),
  processedAt: timestamp('processed_at'),
  adminNotes:  text('admin_notes'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ── Subject Access Requests (SAR) — full UK GDPR compliant table ──────────────
// Replaces ja_gdpr_requests for new SAR/data-export workflow.
// Statuses follow the full lifecycle: submitted → in_review → processing → ready → completed | rejected
export const ja_sar_requests = mysqlTable('ja_sar_requests', {
  id:                    int('id').primaryKey().autoincrement(),
  uuid:                  varchar('uuid', { length: 36 }).notNull().unique(),
  userId:                int('user_id').notNull(),
  email:                 varchar('email', { length: 255 }).notNull(),
  fullName:              varchar('full_name', { length: 255 }).notNull(),

  // Request details
  requestType:           mysqlEnum('request_type', ['sar', 'export', 'deletion', 'rectification', 'restriction', 'portability', 'objection']).notNull().default('sar'),
  notes:                 text('notes'),                        // customer-supplied notes

  // Status lifecycle
  status:                mysqlEnum('status', ['submitted', 'in_review', 'processing', 'ready', 'completed', 'rejected', 'unable_to_complete']).notNull().default('submitted'),

  // UK GDPR deadline tracking (30 calendar days from submission)
  deadlineAt:            timestamp('deadline_at').notNull(),   // submission + 30 days
  deadlineExtendedAt:    timestamp('deadline_extended_at'),    // if extended (max 3 months total)
  deadlineExtendReason:  text('deadline_extend_reason'),

  // Identity verification
  identityVerified:      boolean('identity_verified').notNull().default(false),
  identityVerifiedBy:    varchar('identity_verified_by', { length: 255 }),
  identityVerifiedAt:    timestamp('identity_verified_at'),
  identityNotes:         text('identity_notes'),               // admin notes on verification

  // Admin processing
  assignedTo:            varchar('assigned_to', { length: 255 }),
  adminNotes:            text('admin_notes'),
  rejectionReason:       text('rejection_reason'),
  processedBy:           varchar('processed_by', { length: 255 }),
  processedAt:           timestamp('processed_at'),

  // Export package (for SAR/export requests)
  exportPath:            text('export_path'),                  // /private/sar-exports/{uuid}/export.zip
  exportGeneratedAt:     timestamp('export_generated_at'),
  exportGeneratedBy:     varchar('export_generated_by', { length: 255 }),
  exportFileSizeBytes:   int('export_file_size_bytes'),

  // Secure download token (time-limited, customer-facing)
  downloadToken:         varchar('download_token', { length: 128 }),
  downloadTokenExpiresAt: timestamp('download_token_expires_at'),
  downloadCount:         int('download_count').notNull().default(0),
  lastDownloadAt:        timestamp('last_download_at'),

  // Rate limiting / abuse prevention
  ipAddress:             varchar('ip_address', { length: 45 }),
  userAgent:             text('user_agent'),

  createdAt:             timestamp('created_at').defaultNow().notNull(),
  updatedAt:             timestamp('updated_at').defaultNow().notNull(),
});

// ── Site settings ─────────────────────────────────────────────────────────────
// Key-value store for branding, nav, footer, and feature flags.
// Extends ja_system_config with richer typed values.
export const ja_site_settings = mysqlTable('ja_site_settings', {
  id:        int('id').primaryKey().autoincrement(),
  settingKey: varchar('setting_key', { length: 120 }).notNull().unique(),
  value:     text('value').notNull(),
  updatedBy: varchar('updated_by', { length: 255 }).notNull().default('admin'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Resellers ─────────────────────────────────────────────────────────────────
export const ja_resellers = mysqlTable('ja_resellers', {
  id:               int('id').primaryKey().autoincrement(),
  uuid:             varchar('uuid', { length: 36 }).notNull().unique(),
  userId:           int('user_id'),                                      // linked customer account (if any)

  // Identity
  fullName:         varchar('full_name', { length: 255 }).notNull(),
  email:            varchar('email', { length: 255 }).notNull().unique(),
  phone:            varchar('phone', { length: 60 }),
  company:          varchar('company', { length: 255 }),
  website:          varchar('website', { length: 500 }),
  vatNumber:        varchar('vat_number', { length: 60 }),
  businessType:     varchar('business_type', { length: 100 }),           // e.g. 'IT Reseller', 'Accountant'
  expectedVolume:   varchar('expected_volume', { length: 100 }),         // e.g. '10-50 customers/month'
  howHeard:         varchar('how_heard', { length: 255 }),

  // Auth — resellers log in with email+password (separate from customer OIDC)
  passwordHash:     varchar('password_hash', { length: 255 }).notNull().default(''),
  sessionToken:     varchar('session_token', { length: 128 }),
  sessionExpiresAt: timestamp('session_expires_at'),
  lastLogin:        timestamp('last_login'),

  // Referral
  referralCode:     varchar('referral_code', { length: 30 }).unique(),
  referralLink:     text('referral_link'),

  // Commission settings (per-reseller overrides; null = use global default)
  commissionType:   mysqlEnum('commission_type', ['percentage', 'fixed']).notNull().default('percentage'),
  commissionRate:   int('commission_rate').notNull().default(15),        // % or pence
  commissionRecurring: boolean('commission_recurring').notNull().default(false),
  minPayoutGbp:     int('min_payout_gbp').notNull().default(5000),       // pence, e.g. 5000 = £50

  // Status
  status:           mysqlEnum('status', ['applied', 'approved', 'rejected', 'suspended']).notNull().default('applied'),
  agreedToTerms:    boolean('agreed_to_terms').notNull().default(false),
  agreedAt:         timestamp('agreed_at'),

  // Payout
  payoutMethod:     varchar('payout_method', { length: 60 }),            // 'bank_transfer', 'paypal'
  payoutDetails:    text('payout_details'),                              // JSON, stored securely

  // Admin
  adminNotes:       text('admin_notes'),
  approvedBy:       varchar('approved_by', { length: 255 }),
  approvedAt:       timestamp('approved_at'),
  rejectedBy:       varchar('rejected_by', { length: 255 }),
  rejectedAt:       timestamp('rejected_at'),
  rejectionReason:  text('rejection_reason'),

  // Notifications
  notifyNewSignup:  boolean('notify_new_signup').notNull().default(true),
  notifyCommission: boolean('notify_commission').notNull().default(true),
  notifyAnnouncements: boolean('notify_announcements').notNull().default(true),

  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
});

// ── Reseller → Customer assignments ──────────────────────────────────────────
export const ja_reseller_customers = mysqlTable('ja_reseller_customers', {
  id:           int('id').primaryKey().autoincrement(),
  resellerId:   int('reseller_id').notNull(),
  userId:       int('user_id').notNull(),                                // ja_users.id
  assignedBy:   varchar('assigned_by', { length: 255 }),                // 'referral' | 'admin'
  assignedAt:   timestamp('assigned_at').defaultNow().notNull(),
  notes:        text('notes'),
});

// ── Reseller referral clicks ──────────────────────────────────────────────────
export const ja_reseller_clicks = mysqlTable('ja_reseller_clicks', {
  id:           int('id').primaryKey().autoincrement(),
  resellerId:   int('reseller_id').notNull(),
  ipHash:       varchar('ip_hash', { length: 64 }),
  userAgent:    varchar('user_agent', { length: 500 }),
  landingPage:  varchar('landing_page', { length: 500 }),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

// ── Reseller commissions ──────────────────────────────────────────────────────
export const ja_reseller_commissions = mysqlTable('ja_reseller_commissions', {
  id:              int('id').primaryKey().autoincrement(),
  uuid:            varchar('uuid', { length: 36 }).notNull().unique(),
  resellerId:      int('reseller_id').notNull(),
  userId:          int('user_id'),                                       // customer who triggered commission
  type:            mysqlEnum('type', ['signup', 'subscription', 'renewal']).notNull().default('signup'),
  plan:            varchar('plan', { length: 60 }),
  amountGbp:       int('amount_gbp').notNull().default(0),              // pence — sale value
  commissionGbp:   int('commission_gbp').notNull().default(0),          // pence — commission earned
  status:          mysqlEnum('status', ['pending', 'approved', 'paid', 'rejected', 'on_hold']).notNull().default('pending'),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  paymentRef:      varchar('payment_ref', { length: 255 }),             // admin-entered payout reference
  paidAt:          timestamp('paid_at'),
  paidBy:          varchar('paid_by', { length: 255 }),
  approvedBy:      varchar('approved_by', { length: 255 }),
  approvedAt:      timestamp('approved_at'),
  rejectedBy:      varchar('rejected_by', { length: 255 }),
  rejectionReason: text('rejection_reason'),
  adminNotes:      text('admin_notes'),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
});

// ── Reseller resources (admin-managed) ───────────────────────────────────────
export const ja_reseller_resources = mysqlTable('ja_reseller_resources', {
  id:          int('id').primaryKey().autoincrement(),
  uuid:        varchar('uuid', { length: 36 }).notNull().unique(),
  title:       varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category:    varchar('category', { length: 80 }).notNull().default('general'),
  // 'marketing' | 'brand' | 'product' | 'pricing' | 'onboarding' | 'legal' | 'faq' | 'general'
  fileUrl:     text('file_url'),                                         // download URL
  externalUrl: text('external_url'),                                     // external link
  fileType:    varchar('file_type', { length: 30 }),                     // 'pdf', 'docx', 'image', 'link'
  isActive:    boolean('is_active').notNull().default(true),
  sortOrder:   int('sort_order').notNull().default(0),
  createdBy:   varchar('created_by', { length: 255 }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

// ── Reseller announcements ────────────────────────────────────────────────────
export const ja_reseller_announcements = mysqlTable('ja_reseller_announcements', {
  id:        int('id').primaryKey().autoincrement(),
  uuid:      varchar('uuid', { length: 36 }).notNull().unique(),
  title:     varchar('title', { length: 255 }).notNull(),
  body:      text('body').notNull(),
  priority:  mysqlEnum('priority', ['normal', 'high', 'urgent']).notNull().default('normal'),
  isActive:  boolean('is_active').notNull().default(true),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Reseller support tickets ──────────────────────────────────────────────────
export const ja_reseller_tickets = mysqlTable('ja_reseller_tickets', {
  id:          int('id').primaryKey().autoincrement(),
  uuid:        varchar('uuid', { length: 36 }).notNull().unique(),
  resellerId:  int('reseller_id').notNull(),
  subject:     varchar('subject', { length: 255 }).notNull(),
  status:      mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).notNull().default('open'),
  priority:    mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

export const ja_reseller_ticket_messages = mysqlTable('ja_reseller_ticket_messages', {
  id:         int('id').primaryKey().autoincrement(),
  ticketId:   int('ticket_id').notNull(),
  senderType: mysqlEnum('sender_type', ['reseller', 'admin']).notNull(),
  senderId:   int('sender_id').notNull(),
  senderName: varchar('sender_name', { length: 255 }),
  body:       text('body').notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

// ── Reseller audit log ────────────────────────────────────────────────────────
export const ja_reseller_audit = mysqlTable('ja_reseller_audit', {
  id:         int('id').primaryKey().autoincrement(),
  resellerId: int('reseller_id'),
  adminEmail: varchar('admin_email', { length: 255 }),
  action:     varchar('action', { length: 100 }).notNull(),
  detail:     text('detail'),
  ipAddress:  varchar('ip_address', { length: 45 }),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});
