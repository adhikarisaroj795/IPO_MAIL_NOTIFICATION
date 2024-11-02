const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

class IpoService {
  static sentIpoSymbols = new Set(); // Track sent IPOs

  static async initializeBrowser() {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true }); // Set headless: false for debugging
      const page = await browser.newPage();
      return { browser, page };
    } catch (error) {
      console.error("Error initializing browser:", error.message);
      throw error; // Rethrow error for handling upstream
    }
  }

  static async fetchIpoData(page) {
    try {
      const url = "https://www.sharesansar.com/existing-issues";
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector("#myTableEip");
      const content = await page.content();
      return cheerio.load(content);
    } catch (error) {
      console.error("Error fetching IPO data:", error.message);
      throw error; // Rethrow error for handling upstream
    }
  }

  static async parseIpoData($) {
    const ipotable = $("#myTableEip");
    const potable = $("#myTableEip");
    const data = [];

    ipotable.find("tr").each((index, element) => {
      if (index === 0) return; // Skip the header row
      const tds = $(element).find("td");
      if (tds.length >= 12) {
        const issueData = {
          symbol: $(tds[1]).text().trim() || "N/A",
          price: $(tds[4]).text().trim() || "N/A",
          openingDate: $(tds[5]).text().trim() || "N/A",
          closingDate: $(tds[6]).text().trim() || "N/A",
          status: $(tds[10]).text().trim() || "N/A",
        };
        data.push(issueData);
      }
    });

    return data;
  }

  static async sendEmail(openIssues, recipient = "adhikarisaroj291@gmail.com") {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.NODE_MAILER_USER,
          pass: process.env.NODE_MAILER_PASS,
        },
      });

      const issueDetails = openIssues
        .map(
          (issue) =>
            `Symbol: ${issue.symbol}\nPrice: ${issue.price}\nOpening Date: ${issue.openingDate}\nClosing Date: ${issue.closingDate}\nStatus: ${issue.status}`
        )
        .join("\n\n");

      const msg = {
        from: { name: "TechTaal", address: process.env.NODE_MAILER_USER },
        to: recipient,
        subject: "New IPO Alert",
        text: `The following IPOs are currently open:\n\n${issueDetails}`,
      };

      await transporter.sendMail(msg);
      console.log("Email sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  }
}

module.exports = IpoService;
