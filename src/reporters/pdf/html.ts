import * as cpy from "cpy";
import * as ejs from "ejs";
import moment = require("moment");

function processReportData(reportData: any, includeOnlyIssues?: boolean) {
  const reportSummary: any[] = [];
  const totalreportSummary: any = {};
 
  for (const serviceName in reportData) {
    if(serviceName === 'aws.account') {
      continue;
  } 


  const serviceCheckData = {
    service: serviceName,
    noOfChecks: 0,
    noOfGood: 0,
    noOfWarning: 0,
    noOfFailure: 0
  };  
  for (const checkName in reportData[serviceName]) {
    for (const regionName in reportData[serviceName][checkName].regions) {
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
         
         reportData[serviceName][checkName].regions[regionName] = regionDetails;
        }
        if (regionDetails && regionDetails.length) {
          reportData[serviceName][checkName].resourceName =
            regionDetails[0].resourceSummary.name;
        }
      }
      if (reportData[serviceName][checkName].resourceName) {
        reportData[serviceName].isUsed = true;
      }
  }
  reportSummary.push(serviceCheckData);
  totalreportSummary.noOfChecks= (totalreportSummary.noOfChecks || 0) + serviceCheckData.noOfChecks;
  totalreportSummary.noOfFailure= (totalreportSummary.noOfFailure || 0) + serviceCheckData.noOfFailure;
  totalreportSummary.noOfGood= (totalreportSummary.noOfGood || 0) + serviceCheckData.noOfGood;
  totalreportSummary.noOfWarning= (totalreportSummary.noOfWarning || 0) + serviceCheckData.noOfWarning;  
}
return {
  servicesData: reportData,
  summaryData: modifyServiceNames(reportSummary),
  totalsummaryData:totalreportSummary
};
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
    "aws.vpc": "Amazon VPC"
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
  return await new Promise((resolve, reject) => {
    ejs.renderFile(__dirname + "/template.ejs", { totalData }, {}, function(
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
