/**
 * Resume PDF Generator
 * Uses Puppeteer to render index.html and export as A4 PDF.
 *
 * Usage:  node pdf/generate.js
 * Output: pdf/output/Gladson_Simplicio_CV.pdf
 */
const puppeteer = require('puppeteer');
const path = require('path');

const INPUT = path.resolve(__dirname, '..', 'index.html');
const OUTPUT = path.resolve(__dirname, 'output', 'Gladson_Simplicio_CV.pdf');

(async () => {
  console.log('⚡ Generating PDF...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.goto(`file://${INPUT}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    await page.pdf({
      path: OUTPUT,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    });

    console.log(`✅ PDF generated: ${OUTPUT}`);
  } finally {
    await browser.close();
  }
})();
