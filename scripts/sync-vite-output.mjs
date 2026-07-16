import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const source = path.join(root, 'dist');
const destination = path.resolve(root, process.env.PUBLISH_DIR || 'public');
const staticAssets = path.join(root, 'static');

const sourceStats = await stat(source).catch(() => null);
if (!sourceStats?.isDirectory()) {
  throw new Error('Vite output directory "dist" was not found. Run the Vite build first.');
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

// Cloudflare serves /public directly. Copy source-owned compatibility assets
// after the generated Vite bundle so legacy browser sessions can be upgraded.
const staticStats = await stat(staticAssets).catch(() => null);
if (staticStats?.isDirectory()) {
  await cp(staticAssets, destination, { recursive: true });
}

console.log(`Published Vite output to ${path.relative(root, destination) || destination}`);
