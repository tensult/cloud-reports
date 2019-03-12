export function generateCSV(reportData: any, options?: {
    showIssuesOnly: boolean,
}) {
    const records = prepareRecords(reportData, options);
    return records.map((record) => {
        return record.join(",").replace(/\s+/g, " ");
    }).join("\n");
}

function prepareRecords(reportData, options) {
    options = options || { showIssuesOnly: false };
    const records = [["ServiceName", "CheckName", "Region", "ResourceName",
        "ResourceValue", "Message", "Action", "Severity"]];
    for (const serviceName in reportData) {
        for (const checkName in reportData[serviceName]) {
            for (const regionName in reportData[serviceName][checkName].regions) {
                let regionDetails = reportData[serviceName][checkName].regions[regionName];
                if (options.showIssuesOnly) {
                    regionDetails = regionDetails.filter((resourceDetails) => {
                        return resourceDetails.severity === "Warning" ||
                            resourceDetails.severity === "Failure";
                    });
                    reportData[serviceName][checkName].regions[regionName] = regionDetails;
                }
                for (const regionResourceDetails of regionDetails) {
                    records.push([serviceName, checkName, regionName,
                        regionResourceDetails.resourceSummary.name, regionResourceDetails.resourceSummary.value,
                        regionResourceDetails.message, regionResourceDetails.action, regionResourceDetails.severity,
                    ]);
                }
            }
        }
    }
    return records;
}
