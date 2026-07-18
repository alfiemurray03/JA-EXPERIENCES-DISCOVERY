import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const source = path.join(root, 'dist');
const destination = path.resolve(root, process.env.PUBLISH_DIR || 'public');
const staticAssets = path.join(root, 'static');
const manifestName = '.asset-manifest.json';

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(path.join(directory, entry.name), relative));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }

  return files;
}

const sourceStats = await stat(source).catch(() => null);
if (!sourceStats?.isDirectory()) {
  throw new Error('Vite output directory "dist" was not found. Run the Vite build first.');
}

const currentReleaseAssets = await listFiles(path.join(source, 'assets'), 'assets');
let previousReleaseAssets = [];

try {
  const manifest = JSON.parse(await readFile(path.join(destination, manifestName), 'utf8'));
  if (Array.isArray(manifest.assets)) {
    previousReleaseAssets = manifest.assets.filter(asset => typeof asset === 'string');
  }
} catch {
  // First migration: retain the existing release once, then future manifests
  // keep the current and immediately previous releases only.
  previousReleaseAssets = await listFiles(path.join(destination, 'assets'), 'assets');
}

const preservedRoot = await mkdtemp(path.join(os.tmpdir(), 'ja-plan-studio-static-'));
const preservationMap = new Map([
  ['coming-soon', 'coming-soon'],
  [path.join('assets', 'js', 'coming-soon.js'), path.join('assets', 'js', 'coming-soon.js')],
]);

for (const asset of previousReleaseAssets) {
  preservationMap.set(asset, asset);
}

try {
  for (const [sourceRelative, targetRelative] of preservationMap) {
    const existing = path.join(destination, sourceRelative);
    const existingStats = await stat(existing).catch(() => null);
    if (!existingStats) continue;
    const preserved = path.join(preservedRoot, targetRelative);
    await mkdir(path.dirname(preserved), { recursive: true });
    await cp(existing, preserved, { recursive: true });
  }

  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });

  // Source-owned compatibility files are copied after Vite output. These may
  // include aliases that safely refresh browser tabs opened on an older build.
  const staticStats = await stat(staticAssets).catch(() => null);
  if (staticStats?.isDirectory()) {
    await cp(staticAssets, destination, { recursive: true });
  }

  for (const [, targetRelative] of preservationMap) {
    const preserved = path.join(preservedRoot, targetRelative);
    const preservedStats = await stat(preserved).catch(() => null);
    if (!preservedStats) continue;
    const target = path.join(destination, targetRelative);
    const targetStats = await stat(target).catch(() => null);
    if (targetStats) continue;
    await mkdir(path.dirname(target), { recursive: true });
    await cp(preserved, target, { recursive: true });
  }

  await writeFile(
    path.join(destination, manifestName),
    `${JSON.stringify({ version: 1, assets: currentReleaseAssets }, null, 2)}\n`,
    'utf8',
  );
} finally {
  await rm(preservedRoot, { recursive: true, force: true });
}

console.log(`Published Vite output to ${path.relative(root, destination) || destination}`);
