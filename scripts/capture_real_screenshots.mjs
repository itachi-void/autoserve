import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const outputDir = path.resolve("public/portfolio");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log("Launching browser with executable:", executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: {
      width: 1700,
      height: 970,
      deviceScaleFactor: 2, // High-DPI crystal clear quality (3400x1940)
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1700,
      height: 970,
      deviceScaleFactor: 2,
    });

    console.log("Navigating to http://localhost:8443...");
    await page.goto("http://localhost:8443/", { waitUntil: "networkidle0", timeout: 25000 });

    // Click demo account button
    await page.evaluate(() => {
      const accBtn = document.querySelector(".login-demo-accounts button");
      if (accBtn) accBtn.click();
    });

    // Click submit
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    // Wait for cockpit to appear
    console.log("Waiting for cockpit shell...");
    await page.waitForSelector(".cockpit-shell", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2500));

    // Helper to click sidebar nav items
    async function navigateViaNav(pageKey) {
      console.log(`Navigating to ${pageKey}...`);
      await page.evaluate((key) => {
        // Select sidebar button or call handleSetActivePage
        const btn = document.querySelector(`.cockpit-rail button[aria-label]`);
        // We can set activePage in localStorage and trigger reload or click the sidebar button matching key
        localStorage.setItem("activePage", key);
        window.location.reload();
      }, pageKey);
      await page.waitForSelector(".cockpit-shell", { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 2000));
    }

    // 1. Dashboard (غرفة التحكم)
    console.log("Capturing 01-dashboard.png...");
    await page.screenshot({
      path: path.join(outputDir, "01-dashboard.png"),
      type: "png",
    });
    await page.screenshot({
      path: path.join(outputDir, "cover-dashboard-1700x970.png"),
      type: "png",
    });

    // 2. Work Orders (أوامر التشغيل)
    await navigateViaNav("work-orders");
    console.log("Capturing 02-work-orders.png...");
    await page.screenshot({
      path: path.join(outputDir, "02-work-orders.png"),
      type: "png",
    });

    // 3. Spare Parts (قطع الغيار والمخزون)
    await navigateViaNav("spare-parts");
    console.log("Capturing 03-spare-parts.png...");
    await page.screenshot({
      path: path.join(outputDir, "03-spare-parts.png"),
      type: "png",
    });

    // 4. Inspections (الفحوصات الفنية)
    await navigateViaNav("inspections");
    console.log("Capturing 04-inspections.png...");
    await page.screenshot({
      path: path.join(outputDir, "04-inspections.png"),
      type: "png",
    });

    // 5. Invoices (الفواتير والمالية)
    await navigateViaNav("invoices");
    console.log("Capturing 05-invoices.png...");
    await page.screenshot({
      path: path.join(outputDir, "05-invoices.png"),
      type: "png",
    });

    // 6. Customers (العملاء والمركبات)
    await navigateViaNav("customers");
    console.log("Capturing 06-customers.png...");
    await page.screenshot({
      path: path.join(outputDir, "06-customers.png"),
      type: "png",
    });

    console.log("All real screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Error during real screenshots capture:", err);
  process.exit(1);
});
