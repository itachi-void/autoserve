import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function renderCover() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: {
      width: 1700,
      height: 970,
      deviceScaleFactor: 2,
    },
    args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1700,
    height: 970,
    deviceScaleFactor: 2,
  });

  const filePath = "file://" + path.resolve("scripts/cover-template.html").replace(/\\/g, "/");
  console.log("Loading", filePath);
  await page.goto(filePath, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));

  const outputPath = path.resolve("public/portfolio/hero-cover-1700x970.png");
  await page.screenshot({ path: outputPath, type: "png" });
  console.log("Saved hero cover to", outputPath);

  await browser.close();
}

renderCover().catch(console.error);
