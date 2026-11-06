const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));
  
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().includes('favicon.ico')) {
      console.log('HTTP ERROR:', response.status(), response.url());
    }
  });
  
  console.log('Navigating to root...');
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation timeout'));
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'C:\\Users\\Shashank patel\\.gemini\\antigravity\\brain\\f9bb547a-cb3a-4ed9-870f-68551f2468b4\\admin-test.png' });
  console.log('Saved screenshot to admin-test.png');
  
  await browser.close();
})();
