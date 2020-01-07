import * as cpy from "cpy";
import * as ejs from "ejs";

function processReportData(reportData: any, includeOnlyIssues?: boolean) {
    const reportSummary: any[] = [];
    for (const serviceName in reportData) {

        const serviceCheckData = {
            service: serviceName,
            noOfChecks: 0,
            noOfGood: 0,
            noOfWarning: 0,
            noOfFailure: 0,
        };        
        for (const checkName in reportData[serviceName]) {
            for (const regionName in reportData[serviceName][checkName].regions) {
                if (regionName === "global") {
                    reportData[serviceName][checkName].isGlobal = true;
                }
                let regionDetails = reportData[serviceName][checkName].regions[regionName];

                for (const regionData of reportData[serviceName][checkName].regions[regionName]) {
                    let severity = regionData.severity;
                    if (severity === 'Good') {
                        serviceCheckData.noOfGood++;
                        serviceCheckData.noOfChecks++;
                    } else if (severity === 'Warning') {
                        serviceCheckData.noOfWarning++;
                        serviceCheckData.noOfChecks++;
                    } else if (severity === 'Failure') {
                        serviceCheckData.noOfFailure++;
                        serviceCheckData.noOfChecks++;
                    }
                }
                if (!regionDetails) {
                    continue;
                }
                if (includeOnlyIssues && regionDetails.length) {

                    regionDetails = regionDetails.filter((resourceDetails) => {

                        return resourceDetails.severity === "Warning" ||
                            resourceDetails.severity === "Failure";
                    });
                    reportData[serviceName][checkName].regions[regionName] = regionDetails;
                }
                if (regionDetails && regionDetails.length) {
                    reportData[serviceName][checkName].resourceName = regionDetails[0].resourceSummary.name;
                }
            }
            if (reportData[serviceName][checkName].resourceName) {
                reportData[serviceName].isUsed = true;
            }
        }
        reportSummary.push(serviceCheckData);
    }
    return { servicesData: reportData, summaryData: reportSummary };
}

function copyEJSFiles() {
    return cpy(["reporters/**/*.ejs"], "../dist", {
        cwd: "src", parents: true,
    });
}

export async function generateHTML(reportData: any, options?: {
    showIssuesOnly?: boolean,
    debug?: boolean
}) {
    options = options || { showIssuesOnly: false };
    // await copyEJSFiles();
    const totalData = processReportData(reportData, options.showIssuesOnly);
    return await new Promise((resolve, reject) => {
        ejs.renderFile(__dirname + "/template.ejs",
            { totalData }, {}, function (err, html) {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
    });
}
