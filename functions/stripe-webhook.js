export async function onRequestPost({ request, env }) {
const payload = await request.text();
const signatureHeader = request.headers.get("stripe-signature");

if (!env.STRIPE_WEBHOOK_SECRET) {
console.error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
return new Response("Webhook secret not configured.", { status: 500 });
}

const verified = await verifyStripeWebhookSignature(
payload,
signatureHeader,
env.STRIPE_WEBHOOK_SECRET
);

if (!verified) {
console.error("Stripe webhook signature verification failed.");
return new Response("Invalid Stripe signature.", { status: 400 });
}

let event;

try {
event = JSON.parse(payload);
} catch (error) {
console.error("Invalid Stripe webhook JSON payload.", error);
return new Response("Invalid payload.", { status: 400 });
}

if (event.type === "checkout.session.completed") {
const session = event.data.object;

const paymentRecord = {
  event_id: event.id,
  session_id: session.id,
  payment_status: session.payment_status,
  customer_id: session.customer || null,
  customer_email: session.customer_details?.email || null,
  customer_name: session.customer_details?.name || null,
  amount_total: session.amount_total,
  currency: session.currency,
  plan_code: session.metadata?.plan_code || null,
  plan_name: session.metadata?.plan_name || null,
  service_line: session.metadata?.service_line || null,
  payment_intent: session.payment_intent || null,
  created: session.created,
};

console.log("Stripe checkout completed:", paymentRecord);

/*
  Later, this is where we can add:
  - Send an internal email notification
  - Save the payment to a database / Google Sheet / CRM
  - Trigger a customer onboarding email
  - Link payment to a JA Experiences account
*/

}

return new Response("Webhook received.", { status: 200 });
}

export async function onRequestGet() {
return new Response("Stripe webhook endpoint is active.", { status: 200 });
}

async function verifyStripeWebhookSignature(
payload,
signatureHeader,
webhookSecret
) {
if (!payload || !signatureHeader || !webhookSecret) {
return false;
}

const parts = signatureHeader.split(",");
const timestampPart = parts.find((part) => part.startsWith("t="));
const signatureParts = parts.filter((part) => part.startsWith("v1="));

if (!timestampPart || signatureParts.length === 0) {
return false;
}

const timestamp = timestampPart.slice(2);
const currentTimestamp = Math.floor(Date.now() / 1000);
const toleranceSeconds = 300;

if (Math.abs(currentTimestamp - Number(timestamp)) > toleranceSeconds) {
console.error("Stripe webhook timestamp outside tolerance.");
return false;
}

const signedPayload = `${timestamp}.${payload}`;
const encoder = new TextEncoder();

const key = await crypto.subtle.importKey(
"raw",
encoder.encode(webhookSecret),
{ name: "HMAC", hash: "SHA-256" },
false,
["sign"]
);

const signatureBuffer = await crypto.subtle.sign(
"HMAC",
key,
encoder.encode(signedPayload)
);

const expectedSignature = bufferToHex(signatureBuffer);

return signatureParts.some((part) => {
const receivedSignature = part.slice(3);
return timingSafeEqual(expectedSignature, receivedSignature);
});
}

function bufferToHex(buffer) {
return [...new Uint8Array(buffer)]
.map((byte) => byte.toString(16).padStart(2, "0"))
.join("");
}

function timingSafeEqual(a, b) {
if (!a || !b || a.length !== b.length) {
return false;
}

let result = 0;

for (let i = 0; i < a.length; i += 1) {
result |= a.charCodeAt(i) ^ b.charCodeAt(i);
}

return result === 0;
}
