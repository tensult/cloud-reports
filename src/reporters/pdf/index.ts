const pdf = require("html-pdf");
const htmlGenerator = require("./html");

const pdfOptions = {
    format: "A4",
    border: {
        top: "0.2in", // default is 0, units: mm, cm, in, px
        right: "0.2in",
        bottom: "0.2in",
        left: "0.2in",
    },
    header: {
        height: "15mm",
    },
    base: `file://${__dirname}/../html`,
    footer: {
        height: "15mm",
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
