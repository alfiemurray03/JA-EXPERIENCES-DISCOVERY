import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('shared catalogue renders distinct Standard and Business ranges from one plan source', async () => {
  const catalogue = await source('src/components/StandardBusinessPlans.tsx');
  assert.match(catalogue, /Standard Plans/);
  assert.match(catalogue, /Business Plans/);
  assert.match(catalogue, /JA_PLAN_STUDIO_SUBSCRIPTIONS\.map/);
  assert.match(catalogue, /individual_features/);
  assert.match(catalogue, /organisation_features/);
  assert.match(catalogue, /INDIVIDUAL_PLAN_FEATURE_COMPARISON/);
  assert.match(catalogue, /ORGANISATION_PLAN_FEATURE_COMPARISON/);
});

test('checkout keeps Standard and Business account classifications separate', async () => {
  const catalogue = await source('src/components/StandardBusinessPlans.tsx');
  assert.match(catalogue, /accountType=\$\{audience\}/);
  assert.match(catalogue, /audience === 'organisation'/);
  assert.match(catalogue, /audience="individual"/);
  assert.match(catalogue, /audience="organisation"/);
});

test('home and plans routes use the corrected catalogue pages', async () => {
  const app = await source('src/App.tsx');
  assert.match(app, /path: '\/'[\s\S]*StandardBusinessHomePage/);
  assert.match(app, /path: '\/home'[\s\S]*StandardBusinessHomePage/);
  assert.match(app, /path: '\/plans'[\s\S]*StandardBusinessPlansPage/);
  assert.match(app, /path: '\/pricing'[\s\S]*StandardBusinessPlansPage/);
  assert.match(app, /!\['\/', '\/pricing'\]\.includes/);
});

test('homepage replaces the legacy single pricing block', async () => {
  const home = await source('src/pages/home.tsx');
  assert.match(home, /document\.getElementById\('pricing'\)/);
  assert.match(home, /StandardBusinessPlans comparisons=\{false\}/);
  assert.match(home, /#pricing > :not\(\.standard-business-home-plans\)/);
});

test('full plans page explains that names and prices match while features differ', async () => {
  const plans = await source('src/pages/plans.tsx');
  assert.match(plans, /Standard Plans and Business Plans/);
  assert.match(plans, /same four plan names and monthly prices/i);
  assert.match(plans, /Business Plans add organisation-specific sharing and collaboration permissions/);
  assert.match(plans, /StandardBusinessPlans comparisons/);
});
