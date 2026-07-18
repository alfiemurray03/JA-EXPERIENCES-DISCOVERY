import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('compiled public bundle includes Standard and Business plan catalogue text', async () => {
  const files = await readdir(new URL('public/assets/', root));
  const scripts = files.filter(name => name.endsWith('.js'));
  let compiled = '';

  for (const script of scripts) {
    compiled += await source(`public/assets/${script}`);
  }

  assert.match(compiled, /Standard Plans/);
  assert.match(compiled, /Business Plans/);
  assert.match(compiled, /accountType=/);
});

test('publish workflow builds, verifies and commits the public directory', async () => {
  const workflow = await source('.github/workflows/publish-public.yml');
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /Verify Standard and Business plans are compiled/);
  assert.match(workflow, /git add -A public/);
  assert.match(workflow, /github-actions\[bot\]/);
  assert.match(workflow, /git push origin HEAD:main/);
});
