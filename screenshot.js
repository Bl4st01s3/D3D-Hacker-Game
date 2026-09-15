const { chromium } = require('playwright');

(async () => {
    // Start Xvfb to run graphical applications without a display
    const { exec } = require('child_process');
    exec('Xvfb :99 -screen 0 1280x1024x24 &');
    process.env.DISPLAY = ':99';

    // Need a tiny delay for Xvfb to start
    await new Promise(r => setTimeout(r, 1000));

    const browser = await chromium.launch({ headless: false, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('http://localhost:8000/src/index.html?test=true');

    // Wait for the UI to settle
    await new Promise(r => setTimeout(r, 1000));

    // Type a guess to show interaction
    await page.fill('#test-input', 'CODE');
    await page.click('#test-submit');
    await new Promise(r => setTimeout(r, 500));

    await page.fill('#test-input', 'DATA');
    await page.click('#test-submit');
    await new Promise(r => setTimeout(r, 500));

    await page.screenshot({ path: 'frontend-screenshot.png' });
    await browser.close();
    process.exit(0);
})();
