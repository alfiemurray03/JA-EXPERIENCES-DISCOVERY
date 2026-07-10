import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/admin/api.js";

class MockD1 {
  prepare(sql) {
    return {
      bind() { return this; },
      async first() {
        if (sql.includes("site_settings")) return { value: "normal" };
        if (sql.includes("admin_users")) return { email: "alfieholywoodmurray@jagroupservices.co.uk", role: "Platform Owner" };
        if (sql.includes("admin_preferences")) return null;
        return null;
      },
      async run() { return { success: true }; },
      async all() {
        return { results: [] };
      }
    };
  }
}

test("admin API GET section handlers return real platform D1 data", async () => {
  const DB = new MockD1();
  const env = { DB, ADMIN_EMAIL: "alfieholywoodmurray@jagroupservices.co.uk" };

  for (const section of ["builders", "credits", "usage", "addons"]) {
    const request = new Request(`https://experiences.example.com/admin/api?section=${section}`, {
      headers: {
        "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk",
        "x-ja-auth-name": "Alfie"
      }
    });

    const response = await onRequest({ request, env });
    assert.equal(response.status, 200, `section ${section} should load successfully`);
    const data = await response.json();
    assert.ok(data.admin, `section ${section} response should include admin context`);
    assert.ok(data.platform, `section ${section} response should include platform D1 data`);
    assert.ok(Array.isArray(data.platform.builders), `section ${section} platform should include builders`);
    assert.ok(Array.isArray(data.platform.outputs), `section ${section} platform should include outputs`);
    assert.ok(Array.isArray(data.platform.ledger), `section ${section} platform should include ledger`);
    assert.ok(Array.isArray(data.platform.attempts), `section ${section} platform should include attempts`);
    assert.ok(Array.isArray(data.platform.addons), `section ${section} platform should include addons`);
    assert.ok(Array.isArray(data.platform.trials), `section ${section} platform should include trials`);
  }
});
