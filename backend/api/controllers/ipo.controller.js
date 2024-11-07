const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path"); // Import path module
const cron = require("node-cron");
const ipo_svc = require("../service/IpoService");

const filePath = path.join(__dirname, "../service/IpoService.js");
if (fs.existsSync(filePath)) {
  console.log("file is here");
} else {
  console.error("Error: IpoService.js not found at", filePath);
}

class IpoController {
  static async ipoListing(req, res, next) {
    let browser;
    try {
      const { browser: browserInstance, page } =
        await ipo_svc.initializeBrowser();
      browser = browserInstance;

      const $ = await ipo_svc.fetchIpoData(page);
      const data = await ipo_svc.parseIpoData($);

      const openIssues = data.filter(
        (issue) => issue.status.toLowerCase() === "open"
      );
      const newOpenIssues = openIssues.filter(
        (issue) => !ipo_svc.sentIpoSymbols.has(issue.symbol)
      );

      if (newOpenIssues.length > 0) {
        console.log("New open IPOs:", newOpenIssues);
        await ipo_svc.sendEmail(newOpenIssues);
        newOpenIssues.forEach((issue) =>
          ipo_svc.sentIpoSymbols.add(issue.symbol)
        );
      } else {
        console.log("No new open IPOs to notify.");
      }
      if (res) {
        res.json(data);
      }
    } catch (error) {
      console.error("Error fetching IPO data:", error.message);
      if (res) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

cron.schedule("06 07 * * *", async () => {
  const nepalTime = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kathmandu",
  });
  console.log(`Running daily IPO check at ${nepalTime} Nepal time...`);

  try {
    await IpoController.ipoListing();
  } catch (error) {
    console.error("Error running scheduled IPO check:", error.message);
  }
});

module.exports = IpoController;
