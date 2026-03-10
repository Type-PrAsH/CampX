import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/");
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'playwright_full.png', fullPage: true });
  console.log("Screenshot saved.");
  
  await browser.close();
})();
