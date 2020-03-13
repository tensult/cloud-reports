
import * as cpy from "cpy";
import * as ejs from "ejs";

function processReportData(reportData: any, includeOnlyIssues?: boolean) {
  const reportSummary: any[] = [];
  const totalreportSummary: any = {};
  for (const serviceName in reportData) {
    if (serviceName === 'aws.account') {
      continue;
    }
    const serviceCheckData = {
      service: serviceName,
      noOfChecks: 0,
      noOfGood: 0,
      noOfWarning: 0,
      noOfFailure: 0,
      noOfInfo: 0
    };
    for (const checkName in reportData[serviceName]) {
      reportData[serviceName][checkName].allRegionsData = [];
      for (const regionName in reportData[serviceName][checkName].regions) {
        let regionsData = reportData[serviceName][checkName].regions[regionName].map(e => { e.region = regionName; return e; });
        reportData[serviceName][checkName].allRegionsData = reportData[serviceName][checkName].allRegionsData.concat(regionsData);
        if (regionName === "global") {
          reportData[serviceName][checkName].isGlobal = true;
        }
        let regionDetails =
          reportData[serviceName][checkName].regions[regionName];
        for (const regionData of reportData[serviceName][checkName].regions[
          regionName
        ]) {
          let severity = regionData.severity;
          serviceCheckData.noOfChecks++;
          if (severity === "Good") {
            serviceCheckData.noOfGood++;
          } else if (severity === "Warning") {
            serviceCheckData.noOfWarning++;
          } else if (severity === "Failure") {
            serviceCheckData.noOfFailure++;
          } else if (severity === "Info") {
            serviceCheckData.noOfInfo++;
          }
        }
        if (!regionDetails) {
          continue;
        }
        if (includeOnlyIssues && regionDetails.length) {
          regionDetails = regionDetails.filter(resourceDetails => {
            return (
              resourceDetails.severity === "Warning" ||
              resourceDetails.severity === "Failure"
            );
          });
          reportData[serviceName][checkName].regions[
            regionName
          ] = regionDetails;
        }
        if (regionDetails && regionDetails.length) {
          reportData[serviceName][checkName].resourceName =
            regionDetails[0].resourceSummary.name;
        }
      }
      reportData[serviceName][checkName].allRegionsData = sortRegionData(reportData[serviceName][checkName].allRegionsData);
      if (reportData[serviceName][checkName].resourceName) {
        reportData[serviceName].isUsed = true;
      }
    }
    reportSummary.push(serviceCheckData);
    totalreportSummary.noOfChecks = (totalreportSummary.noOfChecks || 0) + serviceCheckData.noOfChecks;
    totalreportSummary.noOfFailure = (totalreportSummary.noOfFailure || 0) + serviceCheckData.noOfFailure;
    totalreportSummary.noOfGood = (totalreportSummary.noOfGood || 0) + serviceCheckData.noOfGood;
    totalreportSummary.noOfWarning = (totalreportSummary.noOfWarning || 0) + serviceCheckData.noOfWarning;
    totalreportSummary.noOfInfo = (totalreportSummary.noOfInfo || 0) + serviceCheckData.noOfInfo;
  }
  return {
    servicesData: reportData,
    summaryData: modifyServiceNames(reportSummary),
    totalsummaryData: totalreportSummary
  };
}
function sortRegionData(regionData: any[]) {
  if (regionData.length === 0) {
    return regionData;
  }
  const newRegionData: any[] = [];
  while (regionData.findIndex(e => e.severity === "Failure") !== -1) {
    const index = regionData.findIndex(e => e.severity === "Failure");
    newRegionData.push(regionData[index]);
    regionData.splice(index, 1);
  }
  while (regionData.findIndex(e => e.severity === "Warning") !== -1) {
    const index = regionData.findIndex(e => e.severity === "Warning");
    newRegionData.push(regionData[index]);
    regionData.splice(index, 1);
  }
  while (regionData.findIndex(e => e.severity === "Info") !== -1) {
    const index = regionData.findIndex(e => e.severity === "Info");
    newRegionData.push(regionData[index]);
    regionData.splice(index, 1);
  }
  while (regionData.findIndex(e => e.severity === "Good") !== -1) {
    const index = regionData.findIndex(e => e.severity === "Good");
    newRegionData.push(regionData[index]);
    regionData.splice(index, 1);
  }
  return newRegionData;
}
function modifyServiceNames(reportSummary) {
  const newReportSummary = reportSummary;
  const serviceNameMap = {
    "aws.acm": "AWS ACM",
    "aws.apigateway": "Amazon API Gateway",
    "aws.cloudfront": "Amazon CloudFront",
    "aws.cloudwatch": "Amazon CloudWatch",
    "aws.dynamodb": "AWS DynamoDB",
    "aws.ebs": "Amazon EBS",
    "aws.ec2": "Amazon EC2",
    "aws.elasticsearch": "Amazon Elasticsearch",
    "aws.elb": "Elastic Load Balancing",
    "aws.iam": "AWS IAM",
    "aws.lambda": "AWS Lambda",
    "aws.rds": "Amazon RDS",
    "aws.resourcegroups": "AWS Resource Groups",
    "aws.route53": "Amazon Route 53",
    "aws.s3": "Amazon S3",
    "aws.sns": "Amazon SNS",
    "aws.sqs": "Amazon SQS",
    "aws.trails": "AWS CloudTrail",
    "aws.vpc": "Amazon VPC",
    "aws.redshift": "Amazon Redshift"
  };
  for (let data of newReportSummary) {
    if (serviceNameMap[data.service]) {
      data.service = serviceNameMap[data.service];
    }
  }
  return newReportSummary;
}
function copyEJSFiles() {
  return cpy(["reporters/**/*.ejs"], "../dist", {
    cwd: "src",
    parents: true
  });
}

function getServicesHasData(totalData) {
  const services: string[] = [];
  for (var service in totalData.servicesData) {
    for (var check in totalData.servicesData[service]) {
      if (totalData.servicesData[service][check].allRegionsData && totalData.servicesData[service][check].allRegionsData.length > 0) {
        services.push(service.replace('aws.', ''));
        break;
      }
    }
  }
  return services;
}

function getCurrentDate() {
  const dateObj = new Date();
  var dd = String(dateObj.getDate()).padStart(2, '0');
  var mm = String(dateObj.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = dateObj.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

export async function generateHTML(
  reportData: any,
  options?: {
    showIssuesOnly?: boolean;
    debug?: boolean;
  }
) {
  options = options || { showIssuesOnly: false };
  // await copyEJSFiles();
  const totalData = processReportData(reportData, options.showIssuesOnly);
  const servicesHasData = getServicesHasData(totalData);
  const awsAccountId = totalData.servicesData["aws.account"] ? totalData.servicesData["aws.account"].summary.regions.global[0].resourceSummary.value : "";
  return await new Promise((resolve, reject) => {
    ejs.renderFile(__dirname + "/template.ejs", {
      totalData,
      awsAccountId,
      servicesHasData,
      currentDate: getCurrentDate()
    }, {}, function (
      err,
      html
    ) {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
}


