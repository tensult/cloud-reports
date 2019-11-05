import fs = require("fs");
import puppeteer = require("puppeteer");
import htmlGenerator = require("./html");

const pdfOptions: puppeteer.PDFOptions = {
    displayHeaderFooter: true,
    footerTemplate: `
        <div class="footer">
          <hr>
          <span class="copyright" style="float: left;">
            Copyright &copy; Eighty Two East IT Solutions Pvt Ltd ${new Date().getUTCFullYear()}
          </span>
          <span class="pageNumber" style="float: right;">
            {{page}} of {{pages}}
          </span>
        </div>`,
    format: "A4",
    margin: {
        bottom: "0.2in",
        left: "0.2in",
        right: "0.2in",
        top: "0.2in", // default is 0, units: mm, cm, in, px
    },
};

async function createPDF(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    return await page.pdf(pdfOptions);
}

export async function generatePDF(reportData: any, options?: {
    showIssuesOnly?: boolean,
    debug?: boolean,
}) {
    options = options || {};
    const html = await htmlGenerator.generateHTML(reportData, options);
    if (options.debug) {
        console.log("./scan_report.html is generated");
        fs.writeFileSync("scan_report.html", html);
    }
    const pdf = await createPDF(html);
    return pdf;
}
