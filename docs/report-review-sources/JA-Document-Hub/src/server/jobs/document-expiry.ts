/**
 * Document expiry cleanup job.
 * Runs on startup and then every hour.
 * Deletes documents whose expires_at has passed.
 * No archive, no recovery — data is permanently removed.
 */
import { db } from '../db/client.js';
import { ja_documents } from '../db/schema.js';
import { lt, isNotNull, and } from 'drizzle-orm';

async function deleteExpiredDocuments(): Promise<void> {
  try {
    const now = new Date();
    const result = await db
      .delete(ja_documents)
      .where(and(
        isNotNull(ja_documents.expiresAt),
        lt(ja_documents.expiresAt, now),
      ));
    const deleted = (result as unknown as { affectedRows?: number }).affectedRows ?? 0;
    if (deleted > 0) {
      console.log(`document-expiry: deleted ${deleted} expired document(s)`);
    }
  } catch (err) {
    console.error('document-expiry.error', err);
  }
}

export function startDocumentExpiryJob(): void {
  // Run immediately on startup
  void deleteExpiredDocuments();
  // Then every hour
  setInterval(() => void deleteExpiredDocuments(), 60 * 60 * 1000);
  console.log('document-expiry: job started (runs hourly)');
}
