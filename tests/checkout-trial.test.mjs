import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/create-checkout-session.js';

const PLAN_DETAILS = {
  personal: ['Explore Plan', 599],
  standard: ['Plan Plan', 799],
  professional: ['Complete Plan', 1499],
  org_starter: ['Together Plan', 3999],
};

function database(overrides = {}) {
  return {
    prepare(sql) {
      const statement = {
        values: [],
        bind(...values) { this.values = values; return this; },
        async run() { return { success: true }; },
        async first() {
          if (sql.includes('FROM site_settings')) return overrides[this.values[0]] ? { value: overrides[this.values[0]] } : null;
          const id = this.values[0];
          const details = PLAN_DETAILS[id];
          if (!details || !sql.includes('FROM service_plans')) return null;
          return { id, plan_name: details[0], plan_type: 'Monthly subscription', price_label: `£${(details[1] / 100).toFixed(2)}`, price_pence: details[1], stripe_price_id: `price_${id}`, is_active: 1 };
        },
      };
      return statement;
    },
  };
}

test('admin Stripe price override is used by the live Explore checkout', async () => {
  const originalFetch = globalThis.fetch;
  let checkoutBody = '';
  globalThis.fetch = async (_url, options) => {
    checkoutBody = String(options?.body || '');
    return new Response(JSON.stringify({ url: 'https://checkout.stripe.test/session' }), { status: 200 });
  };
  try {
    const response = await onRequestGet({
      request: new Request('https://japlanstudio.example/create-checkout-session?plan=personal'),
      env: { DB: database({ stripe_price_personal_override: 'price_admin_explore' }), STRIPE_SECRET_KEY: 'sk_test', STRIPE_PRICE_EXPLORE: 'price_secret_explore' },
    });
    assert.equal(response.status, 303);
    assert.equal(new URLSearchParams(checkoutBody).get('line_items[0][price]'), 'price_admin_explore');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

for (const plan of Object.keys(PLAN_DETAILS)) {
  test(`${plan} checkout includes a 30-day Stripe trial`, async () => {
    const originalFetch = globalThis.fetch;
    let checkoutBody = '';
    globalThis.fetch = async (_url, options) => {
      checkoutBody = String(options?.body || '');
      return new Response(JSON.stringify({ url: 'https://checkout.stripe.test/session' }), { status: 200 });
    };
    try {
      const response = await onRequestGet({
        request: new Request(`https://japlanstudio.example/create-checkout-session?plan=${plan}`),
        env: { DB: database(), STRIPE_SECRET_KEY: 'sk_test', [`STRIPE_PRICE_${plan === 'personal' ? 'EXPLORE' : plan === 'standard' ? 'PLAN' : plan === 'professional' ? 'COMPLETE' : 'TOGETHER'}`]: `price_${plan}` },
      });
      assert.equal(response.status, 303);
      const params = new URLSearchParams(checkoutBody);
      assert.equal(params.get('mode'), 'subscription');
      assert.equal(params.get('subscription_data[trial_period_days]'), '30');
      assert.equal(params.get('subscription_data[metadata][plan_code]'), plan);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
}
