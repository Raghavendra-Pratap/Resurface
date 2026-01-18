#!/usr/bin/env node
/**
 * Syncs the version from package.json to vite.config.ts manifest
 * Run this script after updating the version in package.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const version = packageJson.version;

// Update vite.config.ts
const viteConfigPath = join(rootDir, 'vite.config.ts');
let viteConfig = readFileSync(viteConfigPath, 'utf-8');

// Replace version in the manifest config
viteConfig = viteConfig.replace(
  /version: ['"][\d.]+['"]/,
  `version: '${version}'`
);

writeFileSync(viteConfigPath, viteConfig);

console.log(`✅ Version synced to ${version}`);
console.log('   - Updated vite.config.ts');
console.log('\nNext steps:');
console.log('   1. Run: npm run package');
console.log('   2. Upload tabmind-v' + version + '.zip to Chrome Web Store');
