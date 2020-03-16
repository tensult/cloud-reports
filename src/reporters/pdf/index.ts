import fs = require("fs");
import htmlGenerator = require("./html");


const pdfOptions: any = {
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

const getPuppeteer = async () => {
    try {
        const puppeteer = require('puppeteer');
        return await puppeteer.launch();
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.log('Error(This package is used for local development) ', JSON.stringify(error, null, 2));
            try {
                const chromium = require('chrome-aws-lambda')
                return await chromium.puppeteer.launch({
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath,
                    headless: chromium.headless
                });
            } catch (_error) {
                throw error;
            }
        }
    }
}

async function createPDF(html) {
    let browser: any = null;
    try {
        browser = await getPuppeteer();
        const page = await browser.newPage();
        await page.setContent(html);
        return await page.pdf(pdfOptions);
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export async function generatePDF(reportData: any, options?: {
    showIssuesOnly?: boolean,
    debug?: boolean,
}) {
    try {
        options = options || {};
        const html = await htmlGenerator.generateHTML(reportData, options);

        if (options.debug) {
            console.log("./scan_report.html is generated");
            fs.writeFileSync("scan_report.html", html);
        }

        const pdf = await createPDF(html);

        return pdf;
    } catch (error) {
        throw error;
    }

}
