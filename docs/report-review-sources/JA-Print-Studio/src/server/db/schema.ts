import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  boolean,
  decimal,
  json,
} from 'drizzle-orm/mysql-core';

// ─── BetterAuth required tables ──────────────────────────────────────────────

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: varchar('image', { length: 512 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  role: varchar('role', { length: 50 }).notNull().default('customer'),
  // B2B / B2C account type
  accountType: varchar('account_type', { length: 10 }).notNull().default('b2c'),
  companyName: varchar('company_name', { length: 255 }),
  vatNumber: varchar('vat_number', { length: 50 }),
  b2bApproved: boolean('b2b_approved').notNull().default(false),
  // Staff 2FA — bcrypt hash of the user's chosen 4-digit PIN
  staffPinHash: varchar('staff_pin_hash', { length: 255 }),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 512 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: varchar('user_agent', { length: 512 }),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope', { length: 512 }),
  password: varchar('password', { length: 512 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 512 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── Print Requests ───────────────────────────────────────────────────────────

export const printRequest = mysqlTable('print_request', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  guestEmail: varchar('guest_email', { length: 255 }),
  guestName: varchar('guest_name', { length: 255 }),
  guestPhone: varchar('guest_phone', { length: 50 }),
  product: varchar('product', { length: 100 }).notNull(),
  quantity: int('quantity'),
  size: varchar('size', { length: 100 }),
  finish: varchar('finish', { length: 100 }),
  sides: varchar('sides', { length: 50 }),
  paperStock: varchar('paper_stock', { length: 100 }),
  designSupport: varchar('design_support', { length: 50 }).notNull().default('none'),
  deadline: varchar('deadline', { length: 100 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  // pending | quoted | approved | in_production | dispatched | completed | cancelled
  quoteAmount: decimal('quote_amount', { precision: 10, scale: 2 }),
  quotedAt: timestamp('quoted_at'),
  approvedAt: timestamp('approved_at'),
  paidAt: timestamp('paid_at'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// ─── Uploaded Files ───────────────────────────────────────────────────────────

export const uploadedFile = mysqlTable('uploaded_file', {
  id: varchar('id', { length: 36 }).primaryKey(),
  requestId: varchar('request_id', { length: 36 }).references(() => printRequest.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: int('size_bytes'),
  url: varchar('url', { length: 512 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Messages / Thread ────────────────────────────────────────────────────────

export const message = mysqlTable('message', {
  id: varchar('id', { length: 36 }).primaryKey(),
  requestId: varchar('request_id', { length: 36 })
    .notNull()
    .references(() => printRequest.id, { onDelete: 'cascade' }),
  senderId: varchar('sender_id', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
  senderRole: varchar('sender_role', { length: 50 }).notNull().default('customer'),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Proofs ───────────────────────────────────────────────────────────────────

export const proof = mysqlTable('proof', {
  id: varchar('id', { length: 36 }).primaryKey(),
  requestId: varchar('request_id', { length: 36 })
    .notNull()
    .references(() => printRequest.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  // pending | approved | rejected
  customerNote: text('customer_note'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
});

// ─── Portfolio Items ──────────────────────────────────────────────────────────

export const portfolioItem = mysqlTable('portfolio_item', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  productType: varchar('product_type', { length: 100 }).notNull(),
  description: text('description'),
  finishDetails: varchar('finish_details', { length: 255 }),
  imageUrl: varchar('image_url', { length: 512 }),
  tags: json('tags').$type<string[]>(),
  featured: boolean('featured').notNull().default(false),
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Password Reset Requests ──────────────────────────────────────────────────
// Customers submit a request; admin sees it and manually provides a reset code.

export const passwordResetRequest = mysqlTable('password_reset_request', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  message: text('message'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending | resolved
  createdAt: timestamp('created_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// ─── Audit Log ────────────────────────────────────────────────────────────────
// Every significant action across the platform is recorded here.
// Only admins can view this table.

export const auditLog = mysqlTable('audit_log', {
  id: varchar('id', { length: 36 }).primaryKey(),
  // Who performed the action (null = system / unauthenticated)
  actorId: varchar('actor_id', { length: 36 }),
  actorEmail: varchar('actor_email', { length: 255 }),
  actorRole: varchar('actor_role', { length: 50 }),
  // What happened
  action: varchar('action', { length: 100 }).notNull(),
  // e.g. 'quote_sent', 'user_signup', 'b2b_approved', 'password_reset', 'proof_approved', 'message_sent', 'order_cancelled'
  // The resource this action relates to
  resourceType: varchar('resource_type', { length: 50 }),
  // e.g. 'print_request', 'user', 'proof', 'message'
  resourceId: varchar('resource_id', { length: 36 }),
  // Human-readable summary
  summary: text('summary'),
  // Extra structured data (JSON)
  meta: json('meta').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Staff PIN ────────────────────────────────────────────────────────────────
// Short-lived 6-digit PIN used for staff/admin email-based login.
// Only @jagroupservices.co.uk addresses may request one.

export const staffPin = mysqlTable('staff_pin', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  pin: varchar('pin', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Contact Enquiries ────────────────────────────────────────────────────────

export const contactEnquiry = mysqlTable('contact_enquiry', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  subject: varchar('subject', { length: 255 }),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
