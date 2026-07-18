import { rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const distDir = path.join(process.cwd(), 'dist');

// Keep the currently deployed /public release intact while Vite creates the
// replacement in /dist. The sync step preserves the immediately previous
// hashed assets before publishing the new release, which prevents open browser
// tabs from losing lazy-loaded modules during a deployment.
await rm(distDir, { recursive: true, force: true });
