import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = process.cwd();
const viteConfigPath = path.join(repositoryRoot, 'vite.config.ts');
const syncScriptPath = path.join(repositoryRoot, 'scripts', 'sync-vite-output.mjs');

test('Vite does not treat the committed production bundle as a source public directory', async () => {
  const viteConfig = await readFile(viteConfigPath, 'utf8');
  assert.match(viteConfig, /publicDir:\s*false/);
});

test('production publishing removes a polluted legacy asset history', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'planyx-bundle-test-'));
  const distAssets = path.join(temporaryRoot, 'dist', 'assets');
  const publicAssets = path.join(temporaryRoot, 'public', 'assets');
  const staticRoot = path.join(temporaryRoot, 'static');

  try {
    await mkdir(distAssets, { recursive: true });
    await mkdir(publicAssets, { recursive: true });
    await mkdir(staticRoot, { recursive: true });

    await writeFile(path.join(temporaryRoot, 'dist', 'index.html'), '<!doctype html><title>Current</title>\n');
    await writeFile(path.join(distAssets, 'current.js'), 'console.log("current");\n');
    await writeFile(path.join(publicAssets, 'stale-0.js'), 'console.log("stale");\n');
    await writeFile(path.join(staticRoot, 'sw.js'), 'const cache = "test";\n');

    const pollutedAssets = Array.from({ length: 501 }, (_, index) => `assets/stale-${index}.js`);
    await writeFile(
      path.join(temporaryRoot, 'public', '.asset-manifest.json'),
      `${JSON.stringify({ version: 1, assets: pollutedAssets }, null, 2)}\n`,
    );

    const result = spawnSync(process.execPath, [syncScriptPath], {
      cwd: temporaryRoot,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    await access(path.join(temporaryRoot, 'public', 'assets', 'current.js'));
    await assert.rejects(access(path.join(temporaryRoot, 'public', 'assets', 'stale-0.js')));

    const manifest = JSON.parse(
      await readFile(path.join(temporaryRoot, 'public', '.asset-manifest.json'), 'utf8'),
    );
    assert.deepEqual(manifest, {
      version: 2,
      currentAssets: ['assets/current.js'],
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
