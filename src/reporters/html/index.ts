const ejs = require('ejs');
const cpy = require('cpy');

function processReportData(reportData: any, includeOnlyIssues: boolean) {
    for (let serviceName in reportData) {
        for (let checkName in reportData[serviceName]) {
            for (let regionName in reportData[serviceName][checkName].regions) {
                if (regionName === 'global') {
                    reportData[serviceName][checkName].isGlobal = true;
                }
                let regionDetails = reportData[serviceName][checkName].regions[regionName];
                if (includeOnlyIssues) {
                    regionDetails = regionDetails.filter(resourceDetails => {
                        return resourceDetails.severity < 2;
                    });
                    reportData[serviceName][checkName].regions[regionName] = regionDetails;
                }
                if (regionDetails.length) {
                    reportData[serviceName][checkName].resourceName = regionDetails[0].resourceSummary.name;
                }
            }
            if (reportData[serviceName][checkName].resourceName) {
                reportData[serviceName].isUsed = true;
            }
        }
    }
    return reportData;
}

function copyEJSFiles() {
    return cpy(["reporters/**/*.ejs"], '../dist', {
        cwd: "src", parents: true
    });
}

export async function generateHTML(reportData: any, options?: {
    showIssuesOnly: boolean
}) {
    options = options || { showIssuesOnly: false };
    await copyEJSFiles();
    reportData = processReportData(reportData, options.showIssuesOnly);
    return await new Promise((resolve, reject) => {
        ejs.renderFile(__dirname + "/template.ejs",
            { reportData }, {}, function (err, html) {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
    });
}



