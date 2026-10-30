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
    args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"],
  });

  const filePath = "file://" + path.resolve("scripts/cover-template.html").replace(/\\/g, "/");
  console.log("Loading", filePath);

  // 1. Render standard exact 1700x970
  const page1x = await browser.newPage();
  await page1x.setViewport({
    width: 1700,
    height: 970,
    deviceScaleFactor: 1,
  });
  await page1x.goto(filePath, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));

  const path1700 = path.resolve("public/portfolio/cover-1700x970.png");
  await page1x.screenshot({ path: path1700, type: "png" });
  console.log("Saved exact 1700x970 to", path1700);

  const pathHero = path.resolve("public/portfolio/hero-cover-1700x970.png");
  await page1x.screenshot({ path: pathHero, type: "png" });

  const pathJpg = path.resolve("public/portfolio/cover-1700x970.jpg");
  await page1x.screenshot({ path: pathJpg, type: "jpeg", quality: 95 });
  console.log("Saved high-quality JPEG to", pathJpg);
  await page1x.close();

  // 2. Render 2x retina (3400x1940)
  const page2x = await browser.newPage();
  await page2x.setViewport({
    width: 1700,
    height: 970,
    deviceScaleFactor: 2,
  });
  await page2x.goto(filePath, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));

  const path2x = path.resolve("public/portfolio/cover-1700x970-2x.png");
  await page2x.screenshot({ path: path2x, type: "png" });
  console.log("Saved 2x Retina version to", path2x);
  await page2x.close();

  await browser.close();
  console.log("All renders completed successfully!");
}

renderCover().catch(console.error);
