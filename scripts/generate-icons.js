#!/usr/bin/env node
/**
 * Generate PNG icons from SVG
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sizes = [16, 32, 48, 128];
const svgPath = join(rootDir, 'src/assets/icons/icon.svg');
const outputDirs = [
  join(rootDir, 'src/assets/icons'),
  join(rootDir, 'public/assets/icons')
];

async function generateIcons() {
  console.log('🎨 Generating PNG icons from SVG...\n');
  
  const svgBuffer = readFileSync(svgPath);
  
  for (const size of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    
    for (const dir of outputDirs) {
      const outputPath = join(dir, `icon-${size}.png`);
      writeFileSync(outputPath, pngBuffer);
      console.log(`   ✅ ${outputPath}`);
    }
  }
  
  console.log('\n🎉 All icons generated successfully!');
  console.log('   Run `npm run build` to update the dist folder.');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err.message);
  console.log('\n💡 Make sure sharp is installed: npm install sharp');
  process.exit(1);
});
