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

export async function onRequestGet({ request, env }) {
const url = new URL(request.url);
const planCode = String(url.searchParams.get("plan") || "").trim();

if (!planCode) {
return redirectTo(new URL("/pricing/", request.url).toString());
}

return createCheckoutSession(planCode, env, request);
}

export async function onRequestPost({ request, env }) {
try {
const formData = await request.formData();
const planCode = String(formData.get("plan") || "").trim();

```
return createCheckoutSession(planCode, env, request);
```

} catch (error) {
console.error("Checkout form error:", error);

```
return jsonResponse(
  { error: "Unexpected error while reading the selected plan." },
  500
);
```

}
}

async function createCheckoutSession(planCode, env, request) {
try {
if (!env.STRIPE_SECRET_KEY) {
return jsonResponse(
{ error: "Stripe is not configured. Missing STRIPE_SECRET_KEY." },
500
);
}

```
const selectedPlan = PRICE_MAP[planCode];

if (!selectedPlan) {
  return jsonResponse(
    {
      error: "Invalid plan selected.",
      planCode: planCode,
    },
    400
  );
}

const fallbackSiteUrl = new URL(request.url).origin;
const siteUrl = String(env.SITE_URL || fallbackSiteUrl).replace(/\/+$/, "");

const params = new URLSearchParams();

params.append("mode", "payment");
params.append("line_items[0][price]", selectedPlan.priceId);
params.append("line_items[0][quantity]", "1");
params.append("customer_creation", "always");
params.append("billing_address_collection", "auto");

params.append(
  "success_url",
  siteUrl + "/payment-success/?session_id={CHECKOUT_SESSION_ID}"
);

params.append("cancel_url", siteUrl + "/pricing/?payment=cancelled");

params.append("metadata[service_line]", "JA Experiences & Discovery");
params.append("metadata[plan_code]", planCode);
params.append("metadata[plan_name]", selectedPlan.planName);

params.append(
  "payment_intent_data[metadata][service_line]",
  "JA Experiences & Discovery"
);
params.append("payment_intent_data[metadata][plan_code]", planCode);
params.append(
  "payment_intent_data[metadata][plan_name]",
  selectedPlan.planName
);

const stripeResponse = await fetch(
  "https://api.stripe.com/v1/checkout/sessions",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  }
);

const responseText = await stripeResponse.text();

let session;

try {
  session = JSON.parse(responseText);
} catch (error) {
  console.error("Stripe returned non-JSON response:", responseText);

  return jsonResponse(
    {
      error: "Stripe returned an unreadable response.",
      status: stripeResponse.status,
    },
    500
  );
}

if (!stripeResponse.ok) {
  console.error("Stripe Checkout error:", session);

  return jsonResponse(
    {
      error: "Stripe checkout could not be created.",
      status: stripeResponse.status,
      details:
        session && session.error && session.error.message
          ? session.error.message
          : "Unknown Stripe error.",
    },
    500
  );
}

if (!session || !session.url) {
  console.error("Stripe session missing URL:", session);

  return jsonResponse(
    { error: "Stripe did not return a Checkout URL." },
    500
  );
}

return redirectTo(session.url);
```

} catch (error) {
console.error("Checkout session exception:", error && error.stack ? error.stack : error);

```
return jsonResponse(
  {
    error: "Unexpected error while creating Stripe Checkout.",
    details: error && error.message ? error.message : "Unknown error.",
  },
  500
);
```

}
}

function redirectTo(url) {
return new Response(null, {
status: 303,
headers: {
Location: url,
},
});
}

function jsonResponse(data, status) {
return new Response(JSON.stringify(data, null, 2), {
status: status || 200,
headers: {
"Content-Type": "application/json; charset=utf-8",
},
});
}
