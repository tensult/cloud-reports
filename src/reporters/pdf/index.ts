import pdf = require("html-pdf");
import htmlGenerator = require("./html");

const pdfOptions = {
    base: `file://${__dirname}/../html`,
    border: {
        bottom: "0.2in",
        left: "0.2in",
        right: "0.2in",
        top: "0.2in", // default is 0, units: mm, cm, in, px
    },
    footer: {
        contents: {
            default: `
        <div class="footer">
          <hr>
          <span class="copyright" style="float: left;">
            Copyright &copy; Eighty Two East IT Solutions Pvt Ltd ${new Date().getUTCFullYear()}
          </span>
          <span class="pageNumber" style="float: right;">
            {{page}} of {{pages}}
          </span>
        </div>`,
        },
        height: "15mm",
    },
    format: "A4",
    header: {
        height: "15mm",
    },
};

function createPDF(html) {
    return new Promise((resolve, reject) => {
        pdf.create(html, pdfOptions).toBuffer(function(err, buffer) {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });

}

export function generatePDF(reportData: any, options?: {
    showIssuesOnly: boolean,
}) {
    return htmlGenerator.generateHTML(reportData, options).then((html) => {
        return createPDF(html);
    });
}
