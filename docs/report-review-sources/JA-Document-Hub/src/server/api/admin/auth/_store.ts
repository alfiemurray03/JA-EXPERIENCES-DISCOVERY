/**
 * Admin store — data access helpers for ja_admin_accounts and audit log.
 *
 * NOTE: Admin authentication is now handled entirely by Microsoft Entra ID.
 * The ja_admin_accounts table is retained for backward-compat (existing admin
 * records, action log references) but is no longer used for authentication.
 * The session cookie carries the Microsoft identity directly.
 *
 * Platform operator: JA Group Services Ltd
 */
import crypto from 'node:crypto';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import {
  ja_admin_accounts,
  ja_admin_pins,
  ja_admin_audit_log,
} from '../../../db/schema.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredAdminAccount {
  id: number;
  uuid: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isPlatformOwner: boolean;
  isSystemAdministrator: boolean;
  isPublicRegistrationAllowed: boolean;
  isVerified: boolean;
  mustResetPassword: boolean;
  suspended: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

// ── Password hashing (kept for legacy records only) ───────────────────────────

/** SHA-256 hex hash */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ── Account queries ───────────────────────────────────────────────────────────

export async function getAdminByEmail(email: string): Promise<StoredAdminAccount | null> {
  const rows = await db
    .select()
    .from(ja_admin_accounts)
    .where(eq(ja_admin_accounts.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAdminById(id: number): Promise<StoredAdminAccount | null> {
  const rows = await db
    .select()
    .from(ja_admin_accounts)
    .where(eq(ja_admin_accounts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllAdmins(): Promise<Omit<StoredAdminAccount, 'passwordHash'>[]> {
  const rows = await db
    .select({
      id: ja_admin_accounts.id,
      uuid: ja_admin_accounts.uuid,
      name: ja_admin_accounts.name,
      email: ja_admin_accounts.email,
      role: ja_admin_accounts.role,
      isPlatformOwner: ja_admin_accounts.isPlatformOwner,
      isSystemAdministrator: ja_admin_accounts.isSystemAdministrator,
      isPublicRegistrationAllowed: ja_admin_accounts.isPublicRegistrationAllowed,
      isVerified: ja_admin_accounts.isVerified,
      mustResetPassword: ja_admin_accounts.mustResetPassword,
      suspended: ja_admin_accounts.suspended,
      createdAt: ja_admin_accounts.createdAt,
      lastLogin: ja_admin_accounts.lastLogin,
    })
    .from(ja_admin_accounts);
  return rows;
}

export async function createAdminAccount(data: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Promise<Omit<StoredAdminAccount, 'passwordHash'>> {
  const uuid = `admin-${crypto.randomUUID().slice(0, 8)}`;
  await db.insert(ja_admin_accounts).values({
    uuid,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: hashPassword(data.password),
    role: data.role,
    isPlatformOwner: false,
    isSystemAdministrator: data.role === 'SystemAdministrator' || data.role === 'PlatformOwner',
    isPublicRegistrationAllowed: false,
    isVerified: true,
    mustResetPassword: true,
    suspended: false,
  });
  const created = await getAdminByEmail(data.email);
  if (!created) throw new Error('Failed to retrieve created admin account');
  const { passwordHash: _ph, ...safe } = created;
  return safe;
}

export async function updateAdminAccount(
  id: number,
  updates: Partial<{
    name: string;
    role: string;
    passwordHash: string;
    mustResetPassword: boolean;
    suspended: boolean;
    lastLogin: Date;
  }>
): Promise<void> {
  await db
    .update(ja_admin_accounts)
    .set(updates)
    .where(eq(ja_admin_accounts.id, id));
}

export async function deleteAdminAccount(id: number): Promise<void> {
  await db.delete(ja_admin_accounts).where(eq(ja_admin_accounts.id, id));
}

// ── Login attempt audit log ───────────────────────────────────────────────────

export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ip: string
): Promise<void> {
  try {
    await db.insert(ja_admin_audit_log).values({ email, success, ip });
  } catch (err) {
    console.error('admin.audit.record.error', err);
  }
}

export async function getLoginAttempts(limit = 200) {
  return db
    .select()
    .from(ja_admin_audit_log)
    .orderBy(desc(ja_admin_audit_log.createdAt))
    .limit(limit);
}

// ── PIN management ────────────────────────────────────────────────────────────

/** Generate a 6-digit PIN, store it with 15-minute expiry, return it */
export async function generatePin(email: string): Promise<string> {
  // Invalidate any existing unused PINs for this email
  await db
    .update(ja_admin_pins)
    .set({ used: true })
    .where(eq(ja_admin_pins.email, email.toLowerCase().trim()));

  const pin = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(ja_admin_pins).values({
    email: email.toLowerCase().trim(),
    pin,
    used: false,
    expiresAt,
  });

  return pin;
}

/** Validate a PIN — marks it used on success */
export async function validatePin(
  email: string,
  pin: string
): Promise<{ valid: boolean; reason?: string }> {
  const rows = await db
    .select()
    .from(ja_admin_pins)
    .where(eq(ja_admin_pins.email, email.toLowerCase().trim()))
    .orderBy(desc(ja_admin_pins.createdAt))
    .limit(1);

  const record = rows[0];
  if (!record || record.used || record.pin !== pin) {
    return { valid: false, reason: 'Invalid or already used PIN.' };
  }
  if (new Date() > record.expiresAt) {
    return { valid: false, reason: 'PIN has expired. Please request a new one.' };
  }

  await db
    .update(ja_admin_pins)
    .set({ used: true })
    .where(eq(ja_admin_pins.id, record.id));

  return { valid: true };
}
