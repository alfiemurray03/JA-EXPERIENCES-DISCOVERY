const PRICE_MAP = {
destination_discovery_standard: {
priceId: "price_1TkZu2DZzb3r6Q3cuhKd6KTt",
planName: "Destination Discovery Plan",
},
itinerary_experience_standard: {
priceId: "price_1TkZuJDZzb3r6Q3c9cEy41Iw",
planName: "Itinerary and Experience Planning Plan",
},
complete_planning_standard: {
priceId: "price_1TkZucDZzb3r6Q3cGVNcyvIF",
planName: "Complete Planning Guidance",
},
destination_discovery_social: {
priceId: "price_1TkZuuDZzb3r6Q3c2C6jQuvo",
planName: "Destination Discovery Social Tariff",
},
itinerary_experience_social: {
priceId: "price_1TkZv0DZzb3r6Q3cOh6tjkIM",
planName: "Itinerary Planning Social Tariff",
},
complete_planning_social: {
priceId: "price_1TkZvDDZzb3r6Q3csGxh4vSL",
planName: "Complete Planning Social Tariff",
},
};

export async function onRequestPost({ request, env }) {
try {
if (!env.STRIPE_SECRET_KEY) {
return jsonResponse(
{ error: "Stripe is not configured. Missing STRIPE_SECRET_KEY." },
500
);
}

const formData = await request.formData();
const planCode = String(formData.get("plan") || "").trim();
const selectedPlan = PRICE_MAP[planCode];

if (!selectedPlan) {
  return jsonResponse({ error: "Invalid plan selected." }, 400);
}

const siteUrl =
  env.SITE_URL || "https://experiences.jagroupservices.co.uk";

const params = new URLSearchParams();

params.set("mode", "payment");
params.set("line_items[0][price]", selectedPlan.priceId);
params.set("line_items[0][quantity]", "1");

params.set("customer_creation", "always");
params.set("billing_address_collection", "auto");
params.set("allow_promotion_codes", "false");

params.set(
  "success_url",
  `${siteUrl}/payment-success/?session_id={CHECKOUT_SESSION_ID}`
);
params.set("cancel_url", `${siteUrl}/pricing/?payment=cancelled`);

params.set("metadata[service_line]", "JA Experiences & Discovery");
params.set("metadata[plan_code]", planCode);
params.set("metadata[plan_name]", selectedPlan.planName);

params.set(
  "payment_intent_data[metadata][service_line]",
  "JA Experiences & Discovery"
);
params.set("payment_intent_data[metadata][plan_code]", planCode);
params.set(
  "payment_intent_data[metadata][plan_name]",
  selectedPlan.planName
);

const stripeResponse = await fetch(
  "https://api.stripe.com/v1/checkout/sessions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  }
);

const session = await stripeResponse.json();

if (!stripeResponse.ok) {
  console.error("Stripe Checkout error:", session);

  return jsonResponse(
    {
      error: "Stripe checkout could not be created.",
      details: session.error?.message || "Unknown Stripe error.",
    },
    500
  );
}

if (!session.url) {
  return jsonResponse(
    { error: "Stripe did not return a Checkout URL." },
    500
  );
}

return Response.redirect(session.url, 303);

} catch (error) {
console.error("Checkout session error:", error);

return jsonResponse(
  { error: "Unexpected error while creating Stripe Checkout." },
  500
);

}
}

export async function onRequestGet() {
return Response.redirect("/pricing/", 302);
}

function jsonResponse(data, status = 200) {
return new Response(JSON.stringify(data), {
status,
headers: {
"Content-Type": "application/json; charset=utf-8",
},
});
}
