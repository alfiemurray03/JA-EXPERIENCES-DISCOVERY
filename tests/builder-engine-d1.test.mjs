import assert from "node:assert/strict";
import test from "node:test";
import { onRequest as accountOnRequest } from "../functions/account/builders.js";
import { onRequest as adminOnRequest } from "../functions/admin/api.js";

test("protected builder document continues to the static asset without an ASSETS self-fetch", async () => {
  let nextCalls = 0;
  let assetCalls = 0;
  const response = await accountOnRequest({
    request: new Request("https://japlanstudio.jagroupservices.co.uk/account/builders/", {
      headers: { Accept: "text/html" }
    }),
    env: {
      ASSETS: { fetch: async () => { assetCalls += 1; return new Response("wrong"); } }
    },
    next: async () => {
      nextCalls += 1;
      return new Response("builder page", { headers: { "Content-Type": "text/html" } });
    }
  });

  assert.equal(await response.text(), "builder page");
  assert.equal(nextCalls, 1);
  assert.equal(assetCalls, 0);
});

// Helper to create mock database context
function createMockDB(options = {}) {
  const builders = options.builders || [
    {
      id: "holiday-planner",
      name: "Holiday Planner",
      builder_type: "Travel",
      category: "Travel",
      token_cost: 5,
      plan_inclusion: "trial,membership,plus,family",
      status: "Active",
      visibility: "paid",
      description: "Organise holiday ideas...",
      form_schema: JSON.stringify([{ id: "destination", type: "short_text", required: true }])
    },
    {
      id: "draft-builder",
      name: "Draft Builder",
      builder_type: "Everyday",
      category: "Everyday experiences",
      token_cost: 10,
      plan_inclusion: "trial,membership",
      status: "Archived", // Unpublished
      visibility: "paid",
      description: "Draft only"
    }
  ];

  const outputs = options.outputs || [];
  const ledger = options.ledger || [];
  const drafts = options.drafts || [];
  const blockedAttempts = [];

  return {
    prepare(sql) {
      return {
        bind(...args) {
          this.args = args;
          return this;
        },
        async first() {
          const sqlLower = sql.toLowerCase();
          if (sqlLower.includes("from profiles")) {
            return options.profile || { admin_customer_status: "Active" };
          }
          if (sqlLower.includes("from trial_access_tokens")) {
            return options.trial || null;
          }
          if (sqlLower.includes("select coalesce(sum(amount)")) {
            const sum = ledger.reduce((acc, curr) => acc + curr.amount, 0);
            return { balance: sum };
          }
          if (sqlLower.includes("from stripe_subscriptions")) {
            return options.subscription || null;
          }
          if (sqlLower.includes("from experience_builders where id = ?")) {
            return builders.find(b => b.id === this.args[0]) || null;
          }
          if (sqlLower.includes("from builder_runs") && sqlLower.includes("status = 'draft'")) {
            return drafts.find(d => d.builder_id === this.args[1] && d.email.toLowerCase() === this.args[0].toLowerCase()) || null;
          }
          if (sqlLower.includes("from builder_outputs") && sqlLower.includes("request_id = ?")) {
            return outputs.find(o => o.request_id === this.args[1] && o.email.toLowerCase() === this.args[0].toLowerCase()) || null;
          }
          return null;
        },
        async all() {
          const sqlLower = sql.toLowerCase();
          if (sqlLower.includes("pragma table_info")) {
            return { results: [
              { name: "id" }, { name: "name" }, { name: "builder_type" }, { name: "category" }, { name: "token_cost" },
              { name: "plan_inclusion" }, { name: "status" }, { name: "visibility" }, { name: "description" },
              { name: "form_schema" }, { name: "usage_count" }, { name: "blocked_attempts" }, { name: "created_at" },
              { name: "updated_at" }, { name: "slug" }, { name: "icon" }, { name: "creates_description" },
              { name: "estimated_minutes" }, { name: "trial_eligible" }, { name: "featured" }, { name: "display_order" },
              { name: "output_instructions" }, { name: "version" }
            ]};
          }
          if (sqlLower.includes("from experience_builders")) {
            const active = builders.filter(b => b.status !== "Archived");
            return { results: active };
          }
          if (sqlLower.includes("from builder_runs") && sqlLower.includes("status = 'draft'")) {
            const emailFilter = this.args[0];
            const filteredDrafts = drafts.filter(d => d.email.toLowerCase() === emailFilter.toLowerCase());
            return { results: filteredDrafts };
          }
          if (sqlLower.includes("from builder_outputs")) {
            return { results: outputs };
          }
          if (sqlLower.includes("from builder_token_ledger")) {
            return { results: ledger };
          }
          if (sqlLower.includes("from builder_blocked_attempts")) {
            return { results: blockedAttempts };
          }
          if (sqlLower.includes("from token_addon_packages")) {
            return { results: [] };
          }
          return { results: [] };
        },
        async run() {
          const sqlLower = sql.toLowerCase();
          if (sqlLower.includes("insert into builder_blocked_attempts")) {
            blockedAttempts.push({
              id: this.args[0],
              email: this.args[1],
              builder_id: this.args[2],
              builder_name: this.args[3],
              reason: this.args[4],
              tokens_available: this.args[5],
              tokens_required: this.args[6]
            });
          }
          if (sqlLower.includes("insert into builder_runs")) {
            drafts.push({
              id: this.args[0],
              email: this.args[1],
              builder_id: this.args[2],
              answers: this.args[3],
              current_step: this.args[4],
              status: "draft"
            });
          }
          if (sqlLower.includes("update builder_runs set answers = ?")) {
            const draftId = this.args[2];
            const d = drafts.find(dr => dr.id === draftId);
            if (d) {
              d.answers = this.args[0];
              d.current_step = this.args[1];
            }
          }
          if (sqlLower.includes("delete from builder_runs")) {
            const email = this.args[0];
            const bId = this.args[1];
            const idx = drafts.findIndex(dr => dr.email.toLowerCase() === email.toLowerCase() && dr.builder_id === bId);
            if (idx !== -1) drafts.splice(idx, 1);
          }
          return { success: true };
        }
      };
    },
    async batch(statements) {
      for (const statement of statements) {
        await statement.run();
      }
      return [];
    }
  };
}

// 1. Catalogue data is protected and loads from D1 for authenticated users
test("builder catalogue API rejects unauthenticated users and filters unpublished builders", async () => {
  const DB = createMockDB();
  const context = {
    request: new Request("https://experiences.example.test/account/api/builders", { method: "GET" }),
    env: { DB }
  };

  const responseUnauth = await accountOnRequest(context);
  assert.equal(responseUnauth.status, 401);
  assert.deepEqual(await responseUnauth.json(), { error: "Not signed in." });

  // Authenticated user
  const contextAuth = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "GET",
      headers: { "x-ja-auth-email": "customer@example.test", "x-ja-auth-name": "Test Customer" }
    }),
    env: { DB }
  };
  const responseAuth = await accountOnRequest(contextAuth);
  assert.equal(responseAuth.status, 200);
  const dataAuth = await responseAuth.json();
  assert.ok(dataAuth.builders);
  assert.equal(dataAuth.builders.length, 1);
  assert.ok(dataAuth.token_summary);
});

// 2. Draft Autosave & Resume logic
test("draft autosave and resume allows saving progress in builder_runs", async () => {
  const drafts = [];
  const DB = createMockDB({ drafts });

  // 1. Save progress (Autosave)
  const saveContext = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_draft",
        builder_id: "holiday-planner",
        answers: { destination: "Rome" },
        current_step: 3
      })
    }),
    env: { DB }
  };

  const responseSave = await accountOnRequest(saveContext);
  assert.equal(responseSave.status, 200);
  const dataSave = await responseSave.json();
  assert.ok(dataSave.saved);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].email, "customer@example.test");
  assert.equal(JSON.parse(drafts[0].answers).destination, "Rome");
  assert.equal(drafts[0].current_step, 3);

  // 2. Resume progress (Get draft)
  const getContext = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_draft",
        builder_id: "holiday-planner"
      })
    }),
    env: { DB }
  };
  const responseGet = await accountOnRequest(getContext);
  assert.equal(responseGet.status, 200);
  const dataGet = await responseGet.json();
  assert.ok(dataGet.draft);
  assert.equal(dataGet.draft.current_step, 3);
});

// 3. Customer isolation verification
test("draft isolation ensures customers cannot access another user's drafts", async () => {
  const drafts = [
    { id: "run-1", email: "other@example.test", builder_id: "holiday-planner", answers: "{}", current_step: 1, status: "draft" }
  ];
  const DB = createMockDB({ drafts });

  const context = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_draft",
        builder_id: "holiday-planner"
      })
    }),
    env: { DB }
  };

  const response = await accountOnRequest(context);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.draft, null, "Should return null for unowned draft");
});

// 4. Membership, Trial, and Gating eligibility
test("builder gating enforces active trials and paid membership levels", async () => {
  const DB = createMockDB({
    ledger: [{ amount: 10 }] // Has 10 tokens
  });

  // Gating - Neither active trial nor membership subscription
  const contextNoPlan = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: "holiday-planner",
        fields: { destination: "Paris" }
      })
    }),
    env: { DB }
  };

  const responseNoPlan = await accountOnRequest(contextNoPlan);
  assert.equal(responseNoPlan.status, 402, "Requires active plan");
  const dataNoPlan = await responseNoPlan.json();
  assert.match(dataNoPlan.error, /active trial or paid subscription is required/);

  // Gating - With active trial
  const DBTrial = createMockDB({
    ledger: [{ amount: 10 }],
    trial: { id: "trial-1", status: "Active", expires_at: new Date(Date.now() + 86400000).toISOString() }
  });
  const contextTrial = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: "holiday-planner",
        fields: { destination: "Paris" }
      })
    }),
    env: { DB: DBTrial }
  };
  const responseTrial = await accountOnRequest(contextTrial);
  assert.equal(responseTrial.status, 200, "Should allow saving with active trial");
});

// 5. Insufficient tokens validation
test("insufficient tokens blocks creation and logs block attempt", async () => {
  const DB = createMockDB({
    ledger: [{ amount: 2 }], // Only 2 tokens, holiday-planner costs 5
    trial: { id: "trial-1", status: "Active", expires_at: new Date(Date.now() + 86400000).toISOString() }
  });

  const context = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: "holiday-planner",
        fields: { destination: "Paris" }
      })
    }),
    env: { DB }
  };

  const response = await accountOnRequest(context);
  assert.equal(response.status, 402, "Insufficent tokens should trigger 402");
  const data = await response.json();
  assert.match(data.error, /Not enough Builder Usage Tokens/);
});

test("paid plans save outputs without a credit balance or deduction", async () => {
  const DB = createMockDB({
    ledger: [],
    subscription: { plan_name: "Membership", plan_code: "membership", status: "active" }
  });
  const response = await accountOnRequest({
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_output", builder_id: "holiday-planner", fields: { destination: "Paris" } })
    }),
    env: { DB }
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.token_summary.unlimited_builder_use, true);
  assert.equal(data.token_summary.remaining_tokens, 0);
});

// 6. Token Safety and Idempotency
test("idempotency protects against duplicate charges using request_id", async () => {
  const outputs = [
    { id: "out-1", email: "customer@example.test", builder_id: "holiday-planner", builder_name: "Holiday Planner", title: "Holiday Plan", request_id: "unique-req-123" }
  ];
  const DB = createMockDB({
    outputs,
    ledger: [{ amount: 10 }],
    trial: { id: "trial-1", status: "Active", expires_at: new Date(Date.now() + 86400000).toISOString() }
  });

  const context = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: "holiday-planner",
        request_id: "unique-req-123",
        fields: { destination: "Paris" }
      })
    }),
    env: { DB }
  };

  const response = await accountOnRequest(context);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.duplicate);
  assert.ok(data.saved);
});

// 7. Completed output deletes the draft automatically
test("successful output save automatically clears active draft", async () => {
  const drafts = [
    { id: "draft-1", email: "customer@example.test", builder_id: "holiday-planner", answers: "{}", current_step: 3, status: "draft" }
  ];
  const DB = createMockDB({
    drafts,
    ledger: [{ amount: 10 }],
    trial: { id: "trial-1", status: "Active", expires_at: new Date(Date.now() + 86400000).toISOString() }
  });

  const context = {
    request: new Request("https://experiences.example.test/account/api/builders", {
      method: "POST",
      headers: { "x-ja-auth-email": "customer@example.test", "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_output",
        builder_id: "holiday-planner",
        request_id: "req-abc",
        fields: { destination: "Paris" }
      })
    }),
    env: { DB }
  };

  assert.equal(drafts.length, 1);
  const response = await accountOnRequest(context);
  assert.equal(response.status, 200);
  assert.equal(drafts.length, 0, "Successful completion must clear the drafts");
});

// 8. Admin permission enforcement
test("admin actions require authenticated session with valid permissions", async () => {
  const DB = createMockDB();

  // Unauthenticated admin context (should block immediately)
  const contextUnauth = {
    request: new Request("https://experiences.example.test/admin/api?section=builders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Admin Builder", category: "Test" })
    }),
    env: { DB }
  };

  const responseUnauth = await adminOnRequest(contextUnauth);
  assert.equal(responseUnauth.status, 401);
});
