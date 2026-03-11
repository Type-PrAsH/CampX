import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/");
  await page.waitForTimeout(2000);
  
  // Fill brief
  await page.fill('textarea', 'Test brief');
  
  // Click generate
  await page.click('button:has-text("Generate Campaign")');
  
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
