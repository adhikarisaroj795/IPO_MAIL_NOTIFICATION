const puppeteer = require("puppeteer");
const cron = require("node-cron");
const ipo_svc = require("../service/IpoService");

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
      res.json(data);
    } catch (error) {
      console.error("Error fetching IPO data:", error.message);
      res.status(500).json({ error: "Internal Server Error" }); // Send error response
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Schedule a daily check at 1:20 PM Nepal time (NPT)
cron.schedule("06 07 * * *", async () => {
  const nepalTime = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kathmandu",
  });
  console.log(`Running daily IPO check at ${nepalTime} Nepal time...`);

  try {
    const ipoData = await IpoController.ipoListing();
    console.log(`Fetched ${ipoData.length} IPO records.`);
  } catch (error) {
    console.error("Error running scheduled IPO check:", error.message);
  }
});

module.exports = IpoController;
