import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Auto-increment filename
let n = 1;
let filename;
do {
  filename = label
    ? `screenshot-${n}-${label}.png`
    : `screenshot-${n}.png`;
  n++;
} while (fs.existsSync(path.join(screenshotsDir, filename)));

const outputPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
const fullPage = process.argv[4] !== 'viewport';
await page.screenshot({ path: outputPath, fullPage });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
