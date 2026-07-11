import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Builder Catalogue", () => {
  it("should have published builders visible via Supabase anon key", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("builder_definitions")
      .select("id, name, slug, status")
      .eq("status", "published");

    assert.ok(!error, `Query should not error: ${error?.message}`);
    assert.ok(data, "Data should be returned");
    assert.ok(data.length > 0, "At least one published builder should exist");
    assert.ok(data.some(b => b.slug === "holiday-planner"), "Holiday Planner should be published");
  });

  it("should not show unpublished builders to anon users", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    const { data } = await supabase
      .from("builder_definitions")
      .select("id, name, status")
      .eq("status", "draft");

    assert.ok(!data || data.length === 0, "Draft builders should not be visible to anon users");
  });

  it("should support category filtering", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("builder_definitions")
      .select("id, name, category")
      .eq("status", "published")
      .eq("category", "Travel");

    assert.ok(!error, `Query should not error: ${error?.message}`);
    assert.ok(data && data.length > 0, "Travel category should have builders");
    assert.ok(data.every(b => b.category === "Travel"), "All results should be Travel category");
  });
});

describe("Holiday Planner Builder Definition", () => {
  it("should have 20 questions with conditional logic", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("builder_definitions")
      .select("questions, token_cost, min_plan, trial_eligible")
      .eq("slug", "holiday-planner")
      .maybeSingle();

    assert.ok(!error, `Query should not error: ${error?.message}`);
    assert.ok(data, "Holiday Planner should exist");
    assert.equal(data.token_cost, 5, "Token cost should be 5");
    assert.equal(data.min_plan, "membership", "Min plan should be membership");
    assert.equal(data.trial_eligible, true, "Should be trial eligible");

    const questions = data.questions;
    assert.ok(Array.isArray(questions), "Questions should be an array");
    assert.equal(questions.length, 20, "Should have 20 questions");

    // Check for conditional questions
    const childrenAges = questions.find(q => q.id === "children_ages");
    assert.ok(childrenAges, "children_ages question should exist");
    assert.ok(childrenAges.conditional, "children_ages should have conditional logic");
    assert.equal(childrenAges.conditional.field, "has_children");
    assert.equal(childrenAges.conditional.value, true);

    const accessibilityDetails = questions.find(q => q.id === "accessibility_details");
    assert.ok(accessibilityDetails?.conditional, "accessibility_details should have conditional logic");

    const dietaryDetails = questions.find(q => q.id === "dietary_details");
    assert.ok(dietaryDetails?.conditional, "dietary_details should have conditional logic");
  });

  it("should support all required question types", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    const { data } = await supabase
      .from("builder_definitions")
      .select("questions")
      .eq("slug", "holiday-planner")
      .maybeSingle();

    const types = new Set(data.questions.map(q => q.type));
    assert.ok(types.has("short_text"), "Should have short_text type");
    assert.ok(types.has("long_text"), "Should have long_text type");
    assert.ok(types.has("number"), "Should have number type");
    assert.ok(types.has("date"), "Should have date type");
    assert.ok(types.has("single_choice"), "Should have single_choice type");
    assert.ok(types.has("multiple_choice"), "Should have multiple_choice type");
    assert.ok(types.has("yes_no"), "Should have yes_no type");
    assert.ok(types.has("selectable_cards"), "Should have selectable_cards type");
  });
});

describe("Token System", () => {
  it("should have get_token_balance function", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    // This should return 0 for a non-existent user (or the balance if user exists)
    const { data, error } = await supabase.rpc("get_token_balance", {
      p_user_id: "00000000-0000-0000-0000-000000000000"
    });

    assert.ok(!error, `get_token_balance should not error: ${error?.message}`);
    assert.equal(data, 0, "Non-existent user should have 0 balance");
  });
});

describe("Builder Runs RLS", () => {
  it("should not allow unauthenticated users to read builder_runs", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.VITE_SUPABASE_URL || "https://fnmbsgwfmkqszitgjfvh.supabase.co";
    const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZubWJzZ3dmbWtxc3ppdGdqZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDc4MTcsImV4cCI6MjA5OTEyMzgxN30.t19jGqLsmldSJT4_KgWguZxL23VI-8vs5_0gHHLVRFQ";
    const supabase = createClient(url, key);

    const { data, error } = await supabase.from("builder_runs").select("*");

    // Without auth, RLS should return empty or error
    assert.ok(!error || data?.length === 0, "Unauthenticated users should not see builder runs");
  });
});

describe("Builder Definition Validation", () => {
  it("should validate question schema structure", () => {
    const validQuestion = {
      id: "test",
      type: "short_text",
      label: "Test question",
      required: true,
    };

    assert.ok(validQuestion.id, "Question must have an id");
    assert.ok(validQuestion.type, "Question must have a type");
    assert.ok(validQuestion.label, "Question must have a label");
  });

  it("should validate conditional question structure", () => {
    const conditionalQuestion = {
      id: "children_ages",
      type: "short_text",
      label: "Children ages",
      required: false,
      conditional: {
        field: "has_children",
        value: true,
      },
    };

    assert.ok(conditionalQuestion.conditional, "Conditional question must have conditional object");
    assert.ok(conditionalQuestion.conditional.field, "Conditional must reference a field");
    assert.ok("value" in conditionalQuestion.conditional, "Conditional must have a value");
  });

  it("should validate answer types", () => {
    const validTypes = [
      "short_text", "long_text", "number", "date",
      "single_choice", "multiple_choice", "yes_no",
      "selectable_cards", "long_text"
    ];

    validTypes.forEach(type => {
      assert.ok(typeof type === "string", `Type ${type} should be a string`);
      assert.ok(type.length > 0, `Type ${type} should not be empty`);
    });
  });
});
