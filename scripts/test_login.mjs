import puppeteer from "puppeteer-core";

async function test() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:8443/", { waitUntil: "networkidle0" });
  console.log("Title:", await page.title());

  const clicked = await page.evaluate(() => {
    const accBtn = document.querySelector(".login-demo-accounts button");
    if (accBtn) {
      accBtn.click();
      return true;
    }
    return false;
  });
  console.log("Clicked demo account:", clicked);

  const submitClicked = await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
      return true;
    }
    return false;
  });
  console.log("Submit clicked:", submitClicked);

  await new Promise((r) => setTimeout(r, 4000));

  const isCockpit = await page.evaluate(() =>
    Boolean(document.querySelector(".cockpit-shell"))
  );
  const errorText = await page.evaluate(
    () => document.querySelector(".login-error")?.innerText || null
  );
  console.log("Is cockpit rendered?:", isCockpit, "Error text:", errorText);

  await browser.close();
}

test().catch(console.error);
