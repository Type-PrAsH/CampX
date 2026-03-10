import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/");
  
  // Wait a bit to let it render or crash
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'playwright_test.png' });
  console.log("Screenshot saved.");
  
  await browser.close();
})();
