import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const header = await readFile(new URL('../src/layouts/parts/Header.tsx', import.meta.url), 'utf8');
const routes = await readFile(new URL('../src/routes.tsx', import.meta.url), 'utf8');

test('public header only exposes partner, Plan and Help dropdowns', () => {
  assert.match(header, /label: 'Get Your Guide & Headout'/);
  assert.match(header, /href: '\/getyourguide', label: 'Get Your Guide'/);
  assert.match(header, /href: '\/headout', label: 'Headout'/);
  assert.match(header, /label: 'Plan'/);
  assert.match(header, /label: 'Help'/);
  assert.doesNotMatch(header, /label: 'Activities'/);
  assert.doesNotMatch(header, /label: 'Experiences'/);
  assert.doesNotMatch(header, /label: 'Discover'/);
});

test('partner dropdown links use real public routes', () => {
  assert.match(routes, /path: '\/headout'/);
  assert.match(routes, /path: '\/getyourguide'/);
});
