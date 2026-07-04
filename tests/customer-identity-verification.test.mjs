import assert from "node:assert/strict";
import test from "node:test";

import {
  clearCustomerIdentityLock,
  clearCustomerVerificationSession,
  createCustomerVerificationSession,
  isSupervisorContext,
  recordIdentityFailure,
  verifyCustomerSecurityQuestions,
  verifySecretHash
} from "../functions/admin/api.js";

async function pbkdf2(value, salt = "test-salt") {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 210000, hash: "SHA-256" }, key, 256);
  const hash = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `pbkdf2_sha256$210000$${salt}$${hash}`;
}

class IdentityDB {
  constructor() {
    this.lock = null;
    this.questions = [];
    this.sessions = [];
    this.audits = [];
  }

  prepare(sql) {
    const db = this;
    return {
      bind(...values) {
        return {
          async first() {
            if (sql.includes("FROM customer_identity_verification_locks")) return db.lock;
            return null;
          },
          async all() {
            if (sql.includes("FROM customer_security_questions")) return { results: db.questions };
            return { results: [] };
          },
          async run() {
            if (sql.includes("INSERT INTO customer_identity_verification_locks")) {
              db.lock = {
                customer_email: values[0],
                locked_until: values[1],
                is_locked: values[2],
                failed_pin_attempts: values[3],
                failed_security_attempts: values[4],
                reason: values[5],
                cleared_at: null
              };
            } else if (sql.includes("UPDATE customer_identity_verification_locks") && sql.includes("override_reason")) {
              db.lock = { ...db.lock, cleared_at: new Date().toISOString(), cleared_by: values[0], override_reason: values[1], is_locked: 0 };
            } else if (sql.includes("INSERT INTO customer_identity_verification_sessions")) {
              db.sessions.push({ id: values[0], customer_email: values[1], admin_email: values[2], method: values[3], expires_at: values[4], ended_at: null });
            } else if (sql.includes("UPDATE customer_identity_verification_sessions")) {
              for (const session of db.sessions) session.ended_at = new Date().toISOString();
            } else if (sql.includes("INSERT INTO admin_audit_log")) {
              db.audits.push({ action: values[2], entity_id: values[4], summary: values[5], metadata: values[6] });
            }
            return { success: true };
          }
        };
      }
    };
  }
}

test("new PBKDF2 secrets verify and arbitrary values fail", async () => {
  const stored = await pbkdf2("correct answer");
  assert.equal(await verifySecretHash("correct answer", stored), true);
  assert.equal(await verifySecretHash("arbitrary value", stored), false);
});

test("three failed PIN attempts persist and lock the customer profile", async () => {
  const DB = new IdentityDB();
  const identity = { email: "admin@example.test" };
  const first = await recordIdentityFailure(DB, identity, "customer@example.test", "Support PIN", "Mismatch");
  const second = await recordIdentityFailure(DB, identity, "customer@example.test", "Support PIN", "Mismatch");
  const third = await recordIdentityFailure(DB, identity, "customer@example.test", "Support PIN", "Mismatch");
  assert.deepEqual([first.locked, second.locked, third.locked], [false, false, true]);
  assert.equal(DB.lock.failed_pin_attempts, 3);
  assert.equal(DB.lock.is_locked, 1);
  assert.equal(DB.audits.length, 3);
});

test("one failed security-question verification locks immediately", async () => {
  const DB = new IdentityDB();
  const result = await recordIdentityFailure(DB, { email: "admin@example.test" }, "customer@example.test", "Security Questions", "Mismatch");
  assert.equal(result.locked, true);
  assert.equal(DB.lock.failed_security_attempts, 1);
});

test("security questions compare all answers against hashes without returning stored answers", async () => {
  const DB = new IdentityDB();
  DB.questions = [
    { id: "q1", question_label: "First school?", answer_hash: await pbkdf2("oak academy", "salt-1") },
    { id: "q2", question_label: "First pet?", answer_hash: await pbkdf2("milo", "salt-2") }
  ];
  const valid = await verifyCustomerSecurityQuestions(DB, {
    email: "customer@example.test",
    answers: [{ id: "q1", answer: "Oak Academy" }, { id: "q2", answer: "Milo" }]
  });
  const invalid = await verifyCustomerSecurityQuestions(DB, {
    email: "customer@example.test",
    answers: [{ id: "q1", answer: "Wrong" }, { id: "q2", answer: "Milo" }]
  });
  assert.equal(valid.ok, true);
  assert.equal(invalid.ok, false);
  assert.equal("answer_hash" in valid, false);
});

test("verification sessions last 15 minutes and close when leaving the profile", async () => {
  const DB = new IdentityDB();
  const identity = { email: "admin@example.test" };
  const before = Date.now();
  const expiresAt = await createCustomerVerificationSession(DB, identity, "customer@example.test", "Support PIN");
  const duration = new Date(expiresAt).getTime() - before;
  assert.ok(duration >= 899000 && duration <= 901000);
  assert.equal(DB.sessions[0].ended_at, null);
  await clearCustomerVerificationSession(DB, identity, "customer@example.test");
  assert.ok(DB.sessions[0].ended_at);
});

test("only Supervisor and System Administrator roles can override and the reason is audited", async () => {
  assert.equal(isSupervisorContext({ role: "Supervisor" }), true);
  assert.equal(isSupervisorContext({ role: "System Administrator" }), true);
  assert.equal(isSupervisorContext({ role: "Platform Owner" }), true);
  assert.equal(isSupervisorContext({ role: "Senior Administrator", permissions: ["*"] }), false);
  const DB = new IdentityDB();
  DB.lock = { customer_email: "customer@example.test", is_locked: 1, cleared_at: null };
  await clearCustomerIdentityLock(DB, { email: "supervisor@example.test" }, "customer@example.test", "Customer supplied photographic ID");
  assert.equal(DB.lock.override_reason, "Customer supplied photographic ID");
  assert.equal(DB.audits.at(-1).action, "customer_identity_lock_override");
});
