const ELIGIBLE_STATUSES = ["active", "trialing"];

export async function claimPaidStripeSubscription(DB, email) {
  const normalisedEmail = String(email || "").trim().toLowerCase();
  if (!DB || !normalisedEmail) return { claimed: false, reason: "missing_email" };

  const subscription = await DB.prepare(`
    SELECT id, customer_id, customer_email, plan_code, plan_name, status, billing_status,
      current_period_end, trial_end
    FROM stripe_subscriptions
    WHERE lower(customer_email) = lower(?)
      AND lower(COALESCE(status, '')) IN ('active', 'trialing')
      AND (
        lower(COALESCE(billing_status, '')) IN ('paid', 'succeeded')
        OR lower(COALESCE(status, '')) = 'trialing'
      )
    ORDER BY
      CASE WHEN lower(COALESCE(billing_status, '')) IN ('paid', 'succeeded') THEN 0 ELSE 1 END,
      datetime(COALESCE(current_period_end, trial_end, updated_at)) DESC
    LIMIT 1
  `).bind(normalisedEmail).first().catch(() => null);

  if (!subscription?.customer_id || !ELIGIBLE_STATUSES.includes(String(subscription.status || "").toLowerCase())) {
    return { claimed: false, reason: "no_paid_subscription" };
  }

  const owner = await DB.prepare(`
    SELECT email FROM profiles
    WHERE stripe_customer_id = ? AND lower(email) <> lower(?)
    LIMIT 1
  `).bind(subscription.customer_id, normalisedEmail).first().catch(() => null);
  if (owner?.email) return { claimed: false, reason: "already_claimed" };

  await DB.prepare(`
    UPDATE profiles SET
      stripe_customer_id = ?,
      stripe_customer_synced_at = CURRENT_TIMESTAMP,
      membership_status = ?,
      membership_renewal_at = COALESCE(?, ?),
      updated_at = CURRENT_TIMESTAMP
    WHERE lower(email) = lower(?)
  `).bind(
    subscription.customer_id,
    subscription.plan_name || subscription.plan_code || "Active subscription",
    subscription.current_period_end,
    subscription.trial_end,
    normalisedEmail
  ).run();

  return {
    claimed: true,
    subscriptionId: subscription.id,
    customerId: subscription.customer_id,
    planCode: subscription.plan_code || null
  };
}
