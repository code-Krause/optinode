import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const selector = process.argv[3] || '#services';
const label = process.argv[4] || 'section';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

let n = 1;
let filename;
do {
  filename = `screenshot-${n}-${label}.png`;
  n++;
} while (fs.existsSync(path.join(screenshotsDir, filename)));

const outputPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Scroll to section and screenshot it
await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'instant' });
  // trigger all reveals
  document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'));
}, selector);

await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: outputPath, fullPage: false });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
