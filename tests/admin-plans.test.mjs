import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { savePlan, savePlans } from "../functions/admin/api.js";

class MockPlansDB {
  constructor() {
    this.savedBindings = null;
    this.allSavedBindings = [];
  }

  prepare(sql) {
    const database = this;
    return {
      bind(...values) {
        return {
          async run() {
            if (sql.includes("INSERT INTO service_plans")) {
              database.savedBindings = values;
              database.allSavedBindings.push(values);
            }
            return { success: true };
          }
        };
      },
      async all() {
        return {
          results: [
            {
              id: "plan_test",
              plan_name: "Test Plan",
              description: "Updated public description",
              price_label: "£79",
              delivery_time: "3 working days",
              revisions: "2 revisions",
              stripe_product_id: "prod_test",
              stripe_price_id: "price_test",
              button_label: "Book securely",
              is_active: 0,
              is_featured: 1,
              sort_order: 7
            }
          ]
        };
      }
    };
  }
}

test("full plan save persists every editable Plans & Prices field", async () => {
  const DB = new MockPlansDB();

  const plans = await savePlan(DB, {
    id: "plan_test",
    plan_name: "Test Plan",
    plan_type: "Standard",
    description: "Updated public description",
    price_label: "£79",
    price_pence: 7900,
    delivery_time: "3 working days",
    revisions: "2 revisions",
    stripe_product_id: "prod_test",
    stripe_price_id: "price_test",
    button_label: "Book securely",
    is_active: 0,
    is_featured: 1,
    sort_order: 7
  });

  assert.deepEqual(DB.savedBindings, [
    "plan_test",
    "Test Plan",
    "Standard",
    "£79",
    7900,
    "prod_test",
    "price_test",
    "3 working days",
    "2 revisions",
    "Updated public description",
    "Book securely",
    0,
    1,
    7
  ]);
  assert.equal(plans[0].description, "Updated public description");
  assert.equal(plans[0].is_active, 0);
});

test("unified plan save persists complete plans through one frontend action", async () => {
  const DB = new MockPlansDB();
  await savePlans(DB, [
    { id: "one", plan_name: "One", description: "First", price_pence: 100, is_active: 1 },
    { id: "two", plan_name: "Two", description: "Second", price_pence: 200, is_active: 0 }
  ]);
  assert.equal(DB.allSavedBindings.length, 2);
  assert.equal(DB.allSavedBindings[0][9], "First");
  assert.equal(DB.allSavedBindings[1][9], "Second");

  const [client, api] = await Promise.all([
    readFile(new URL("../public/assets/js/admin-control.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/admin/api.js", import.meta.url), "utf8")
  ]);
  assert.match(client, /action:\s*"save_all"/);
  assert.doesNotMatch(client, /save_visibility/);
  assert.doesNotMatch(api, /savePlanVisibility|save_visibility|plan_visibility_save/);
});
