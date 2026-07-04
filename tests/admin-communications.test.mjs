import assert from "node:assert/strict";
import test from "node:test";
import { verifySupportPinRecord } from "../functions/admin/api.js";

async function hashPin(pin) {
  const bytes = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

class MockPinDB {
  constructor(row) {
    this.row = row;
    this.auditEntries = [];
    this.updated = null;
  }

  prepare(sql) {
    const database = this;
    return {
      bind(...values) {
        return {
          async first() {
            if (sql.includes("FROM customer_support_pins")) return database.row;
            return null;
          },
          async run() {
            if (sql.includes("INSERT INTO admin_audit_log")) {
              database.auditEntries.push(values);
              return { success: true };
            }
            if (sql.includes("UPDATE customer_support_pins")) {
              database.updated = values;
              return { success: true };
            }
            return { success: true };
          }
        };
      }
    };
  }
}

test("broadcast notifications create one record per recipient", async () => {
  const calls = [];
  const db = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              calls.push({ sql, values });
              return { success: true };
            },
            async all() {
              return { results: [] };
            },
            async first() {
              return null;
            }
          };
        },
        async all() {
          return { results: [] };
        },
        async first() {
          return null;
        }
      };
    }
  };

  const { saveNotification } = await import("../functions/admin/api.js");
  await saveNotification(db, {
    recipient_mode: "multiple",
    recipient_emails: "one@example.com, two@example.com",
    title: "Broadcast",
    body: "Hello",
    category: "General",
    priority: "Normal",
    status: "Sent",
    delivery_status: "Sent"
  }, { email: "admin@example.com", name: "Admin" });

  assert.equal(calls.filter((call) => call.sql.includes("INSERT INTO customer_notifications")).length, 2);
});

test("support PIN verification updates the active record and records an audit entry", async () => {
  const pinHash = await hashPin("456789");
  const db = new MockPinDB({
    id: "pin-1",
    email: "customer@example.com",
    pin_hash: pinHash,
    pin_last4: "6789",
    status: "Active",
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    used_at: null,
    revoked_at: null,
    revoked_by: null,
    last_used_at: null,
    audit_history: "[]"
  });

  const result = await verifySupportPinRecord(db, {}, "customer@example.com", "456789", "admin@example.com");

  assert.equal(result.ok, true);
  assert.equal(result.recordId, "pin-1");
  assert.equal(db.auditEntries.length, 1);
  assert.equal(db.updated[3], "pin-1");
});

test("support PIN verification rejects an invalid or already-used PIN", async () => {
  const row = {
    id: "pin-1",
    email: "customer@example.com",
    pin_hash: await hashPin("456789"),
    pin_last4: "6789",
    status: "Active",
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    used_at: null,
    revoked_at: null,
    audit_history: "[]"
  };
  const invalidDB = new MockPinDB(row);
  const invalid = await verifySupportPinRecord(invalidDB, {}, row.email, "111111", "admin@example.com");
  assert.equal(invalid.ok, false);
  assert.equal(invalidDB.auditEntries.length, 1);

  const usedDB = new MockPinDB({ ...row, status: "Verified", used_at: new Date().toISOString() });
  const reused = await verifySupportPinRecord(usedDB, {}, row.email, "456789", "admin@example.com");
  assert.equal(reused.ok, false);
  assert.match(reused.error, /already been used/i);
});
