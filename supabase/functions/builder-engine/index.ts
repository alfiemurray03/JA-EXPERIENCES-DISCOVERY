import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // Create a client with the user's auth token for RLS-protected queries
    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "You must be signed in to use builders." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/builder-engine", "");
    const method = req.method;

    // GET /builders - list published builders (catalogue)
    if (path === "/builders" && method === "GET") {
      const { data: builders, error } = await userClient
        .from("builder_definitions")
        .select("id, builder_key, name, slug, category, icon, short_description, creates_description, estimated_minutes, token_cost, min_plan, trial_eligible, featured, display_order")
        .eq("status", "published")
        .order("display_order");

      if (error) throw error;
      return new Response(JSON.stringify({ builders }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /builders/:slug - get a single builder with full question schema
    const singleMatch = path.match(/^\/builders\/([^/]+)$/);
    if (singleMatch && method === "GET") {
      const slug = singleMatch[1];
      const { data: builder, error } = await userClient
        .from("builder_definitions")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      if (!builder) {
        return new Response(JSON.stringify({ error: "Builder not found or not available." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check access
      const accessResult = await checkAccess(supabase, user.id, builder);
      if (!accessResult.allowed) {
        return new Response(JSON.stringify({ builder, access: accessResult }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ builder, access: accessResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /runs - create a new builder run
    if (path === "/runs" && method === "POST") {
      const { builder_id } = await req.json();

      // Get the builder definition
      const { data: builder, error: builderError } = await supabase
        .from("builder_definitions")
        .select("*")
        .eq("id", builder_id)
        .single();

      if (builderError || !builder) {
        return new Response(JSON.stringify({ error: "Builder not found." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (builder.status !== "published") {
        return new Response(JSON.stringify({ error: "This builder is not currently available." }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check access
      const accessResult = await checkAccess(supabase, user.id, builder);
      if (!accessResult.allowed) {
        return new Response(JSON.stringify({ error: accessResult.reason, action: accessResult.action }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create the run
      const { data: run, error: runError } = await userClient
        .from("builder_runs")
        .insert({
          user_id: user.id,
          builder_id: builder.id,
          builder_version: builder.version,
          status: "draft",
          answers: {},
          current_step: 0,
          token_price: builder.token_cost,
        })
        .select()
        .single();

      if (runError) throw runError;

      return new Response(JSON.stringify({ run }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /runs - list the user's runs
    if (path === "/runs" && method === "GET") {
      const { data: runs, error } = await userClient
        .from("builder_runs")
        .select("*, builder_definitions(name, slug, icon, category)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ runs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /runs/:id - get a single run
    const runMatch = path.match(/^\/runs\/([^/]+)$/);
    if (runMatch && method === "GET") {
      const runId = runMatch[1];
      const { data: run, error } = await userClient
        .from("builder_runs")
        .select("*, builder_definitions(name, slug, icon, category, questions, output_instructions)")
        .eq("id", runId)
        .maybeSingle();

      if (error) throw error;
      if (!run) {
        return new Response(JSON.stringify({ error: "Run not found." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ run }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /runs/:id - update a run (autosave)
    if (runMatch && method === "PUT") {
      const runId = runMatch[1];
      const updates = await req.json();

      // Verify ownership
      const { data: existing, error: fetchError } = await userClient
        .from("builder_runs")
        .select("id, user_id, status")
        .eq("id", runId)
        .maybeSingle();

      if (fetchError || !existing) {
        return new Response(JSON.stringify({ error: "Run not found." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateData = {
        answers: updates.answers ?? undefined,
        current_step: updates.current_step ?? undefined,
        status: updates.status ?? undefined,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

      const { data: run, error } = await userClient
        .from("builder_runs")
        .update(updateData)
        .eq("id", runId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ run }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /runs/:id/generate - generate the plan
    const genMatch = path.match(/^\/runs\/([^/]+)\/generate$/);
    if (genMatch && method === "POST") {
      const runId = genMatch[1];

      // Get the run with builder definition
      const { data: run, error: runError } = await userClient
        .from("builder_runs")
        .select("*, builder_definitions!inner(name, slug, questions, output_instructions, token_cost, version)")
        .eq("id", runId)
        .maybeSingle();

      if (runError || !run) {
        return new Response(JSON.stringify({ error: "Run not found." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent duplicate generation
      if (run.status === "generating" || run.status === "completed") {
        return new Response(JSON.stringify({ error: "This plan has already been generated or is currently being generated." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Re-check access
      const accessResult = await checkAccess(supabase, user.id, run.builder_definitions);
      if (!accessResult.allowed) {
        return new Response(JSON.stringify({ error: accessResult.reason, action: accessResult.action }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check token balance
      const { data: balanceData } = await supabase
        .rpc("get_token_balance", { p_user_id: user.id });

      const balance = balanceData || 0;
      if (balance < run.token_price) {
        return new Response(JSON.stringify({
          error: "You do not have enough Builder Usage Tokens.",
          action: "purchase_tokens",
          required: run.token_price,
          balance: balance,
        }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as generating
      await userClient
        .from("builder_runs")
        .update({
          status: "generating",
          updated_at: new Date().toISOString(),
        })
        .eq("id", runId);

      try {
        // Deduct tokens atomically
        const { data: txResult, error: txError } = await supabase
          .rpc("deduct_tokens", {
            p_user_id: user.id,
            p_amount: run.token_price,
            p_transaction_type: "usage",
            p_description: `Builder: ${run.builder_definitions.name}`,
            p_reference_id: runId,
          });

        if (txError || !txResult || txResult.length === 0) {
          throw new Error("Failed to deduct tokens.");
        }

        const transaction = txResult[0];

        // Record the transaction ID on the run
        await userClient
          .from("builder_runs")
          .update({
            token_transaction_id: transaction.ledger_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", runId);

        // Generate the plan
        let result;
        try {
          result = await generatePlan(run);
        } catch (genError) {
          // Refund tokens on generation failure
          await supabase.rpc("refund_tokens", {
            p_user_id: user.id,
            p_amount: run.token_price,
            p_reference_id: runId,
            p_description: `Refund: Generation failed for ${run.builder_definitions.name}`,
          });

          await userClient
            .from("builder_runs")
            .update({
              status: "failed",
              failure_info: genError.message,
              updated_at: new Date().toISOString(),
            })
            .eq("id", runId);

          return new Response(JSON.stringify({
            error: "Generation failed. Your tokens have been refunded.",
            detail: genError.message,
          }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Save the result
        await userClient
          .from("builder_runs")
          .update({
            status: "completed",
            result: result,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", runId);

        // Also save to saved_outputs for "My Plans"
        await userClient
          .from("saved_outputs")
          .insert({
            user_id: user.id,
            builder_id: run.builder_definitions.slug,
            title: `${run.builder_definitions.name} - ${run.answers.destination || "Plan"}`,
            content: result,
            tokens_used: run.token_price,
          });

        return new Response(JSON.stringify({ run: { ...run, status: "completed", result } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        // If we haven't refunded yet, try to refund
        await supabase.rpc("refund_tokens", {
          p_user_id: user.id,
          p_amount: run.token_price,
          p_reference_id: runId,
          p_description: `Refund: Generation error for ${run.builder_definitions.name}`,
        });

        await userClient
          .from("builder_runs")
          .update({
            status: "failed",
            failure_info: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", runId);

        return new Response(JSON.stringify({ error: "Generation failed. Your tokens have been refunded.", detail: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // DELETE /runs/:id - delete a run
    if (runMatch && method === "DELETE") {
      const runId = runMatch[1];
      const { error } = await userClient
        .from("builder_runs")
        .delete()
        .eq("id", runId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /access/:builder_id - check access for a builder
    const accessMatch = path.match(/^\/access\/([^/]+)$/);
    if (accessMatch && method === "GET") {
      const builderId = accessMatch[1];
      const { data: builder } = await supabase
        .from("builder_definitions")
        .select("*")
        .eq("id", builderId)
        .single();

      if (!builder) {
        return new Response(JSON.stringify({ error: "Builder not found." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessResult = await checkAccess(supabase, user.id, builder);
      return new Response(JSON.stringify({ access: accessResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /balance - get token balance
    if (path === "/balance" && method === "GET") {
      const { data: balanceData } = await supabase
        .rpc("get_token_balance", { p_user_id: user.id });

      return new Response(JSON.stringify({ balance: balanceData || 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Check if a user has access to a builder
async function checkAccess(supabase, userId, builder) {
  // Check subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  // Check trial
  const { data: trial } = await supabase
    .from("trial_claims")
    .select("trial_end")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date();
  const hasActiveSub = sub && sub.status === "active" &&
    (!sub.current_period_end || new Date(sub.current_period_end) > now);
  const hasActiveTrial = trial && new Date(trial.trial_end) > now;

  if (!hasActiveSub && !hasActiveTrial) {
    return {
      allowed: false,
      reason: "You need an active membership plan or free trial to use builders.",
      action: "view_plans",
    };
  }

  // Check plan eligibility
  const planOrder = { membership: 1, plus: 2, family: 3 };
  if (hasActiveSub) {
    const userPlanLevel = planOrder[sub.plan] || 0;
    const requiredPlanLevel = planOrder[builder.min_plan] || 0;
    if (userPlanLevel < requiredPlanLevel) {
      return {
        allowed: false,
        reason: `This builder requires the ${builder.min_plan} plan or higher.`,
        action: "upgrade_plan",
      };
    }
  }

  // Check trial eligibility
  if (hasActiveTrial && !hasActiveSub) {
    if (!builder.trial_eligible) {
      return {
        allowed: false,
        reason: "This builder is not available during the free trial.",
        action: "upgrade_plan",
      };
    }
  }

  return { allowed: true };
}

// Generate a plan from builder answers
async function generatePlan(run) {
  const answers = run.answers;
  const instructions = run.builder_definitions.output_instructions;

  // Check if an AI generation provider is configured
  const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("AI_PROVIDER_API_KEY");

  if (!apiKey) {
    // Return a structured "service unavailable" result
    // This is NOT fake output - it clearly tells the customer the generation service is not configured
    return {
      status: "service_unavailable",
      message: "The AI generation service is not currently configured. Please contact support.",
      generated_at: new Date().toISOString(),
      builder: run.builder_definitions.name,
      answers_summary: {
        destination: answers.destination,
        departure_location: answers.departure_location,
        travel_dates: answers.travel_dates,
        trip_length: answers.trip_length,
        num_travellers: answers.num_travellers,
        budget: answers.budget,
        accommodation: answers.accommodation,
        transport: answers.transport,
        interests: answers.interests,
        pace: answers.pace,
      },
      sections: [
        {
          title: "Trip Overview",
          content: `Your trip to ${answers.destination || "your destination"} from ${answers.departure_location || "your departure location"} on ${answers.travel_dates || "your selected date"}. Trip length: ${answers.trip_length || "not specified"}. Number of travellers: ${answers.num_travellers || 1}. Budget: ${answers.budget || "not specified"}.`,
        },
        {
          title: "Important Notice",
          content: "The AI generation service is not currently configured. Once configured, this plan will be replaced with a personalised day-by-day itinerary, recommended activities, transport and budget guidance, and a packing checklist. Please contact support to enable the generation service.",
        },
      ],
      note: "This is a placeholder result. The generation provider must be configured with an OPENAI_API_KEY or AI_PROVIDER_API_KEY secret to produce personalised plans.",
    };
  }

  // If API key is configured, call the AI provider
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a travel planning assistant. Generate a personalised holiday plan based on the customer's answers. Return the result as structured JSON with a 'sections' array containing objects with 'title' and 'content' fields. Include a 'trip_overview' field summarising the trip.",
        },
        {
          role: "user",
          content: `Builder: ${run.builder_definitions.name}\n\nInstructions: ${instructions}\n\nCustomer answers:\n${JSON.stringify(answers, null, 2)}`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI provider returned ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      status: "completed",
      generated_at: new Date().toISOString(),
      raw_output: content,
      sections: [{ title: "Generated Plan", content: content || "No output generated." }],
    };
  }
}
