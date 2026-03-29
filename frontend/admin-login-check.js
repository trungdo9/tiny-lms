const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const events = [];
  page.on('console', msg => events.push({ type: 'console', text: msg.text() }));
  page.on('pageerror', err => events.push({ type: 'pageerror', text: err.message }));
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('3001') || url.includes('/auth/v1/')) {
      events.push({ type: 'response', status: res.status(), url });
    }
  });
  await page.goto('http://127.0.0.1:3000/login');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  const afterLogin = page.url();
  const bodyText = (await page.locator('body').innerText()).slice(0, 1200);
  await page.goto('http://127.0.0.1:3000/admin/dashboard');
  await page.waitForTimeout(5000);
  const adminUrl = page.url();
  const adminText = (await page.locator('body').innerText()).slice(0, 1200);
  console.log(JSON.stringify({ afterLogin, bodyText, adminUrl, adminText, events }, null, 2));
  await browser.close();
})();
