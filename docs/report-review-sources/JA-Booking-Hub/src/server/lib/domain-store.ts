/**
 * File-based domain store.
 * Persists to /private/jabooking-domains.json
 * Shape: { [businessId: string]: DomainRecord }
 *
 * Replace with a DB query once the database skill is wired up.
 */
import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = '/private/jabooking-domains.json';

export interface DomainRecord {
  businessId: string;
  /** The JABooking subdomain slug, e.g. "my-salon" */
  slug: string;
  /** Custom domain entered by the user, e.g. "bookings.mysalon.co.uk" */
  customDomain: string;
  /** verified | pending | failed */
  status: 'pending' | 'verified' | 'failed';
  /** ISO timestamp of when the domain was first saved */
  createdAt: string;
  /** ISO timestamp of last status check */
  checkedAt: string | null;
}

type Store = Record<string, DomainRecord>;

function readStore(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  const dir = path.dirname(STORE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function getByBusinessId(businessId: string): DomainRecord | null {
  const store = readStore();
  return store[businessId] ?? null;
}

export function getByCustomDomain(domain: string): DomainRecord | null {
  const store = readStore();
  return Object.values(store).find((r) => r.customDomain === domain.toLowerCase()) ?? null;
}

export function getBySlug(slug: string): DomainRecord | null {
  const store = readStore();
  return Object.values(store).find((r) => r.slug === slug) ?? null;
}

export function upsert(record: DomainRecord): DomainRecord {
  const store = readStore();
  store[record.businessId] = record;
  writeStore(store);
  return record;
}

export function remove(businessId: string): boolean {
  const store = readStore();
  if (!store[businessId]) return false;
  delete store[businessId];
  writeStore(store);
  return true;
}

/** All records — used by the subdomain routing middleware */
export function getAll(): DomainRecord[] {
  return Object.values(readStore());
}
