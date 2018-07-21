# Cloud Reports
Collects info about various cloud resources and analyzes then against best practices and give a JSON, HTML or PDF reports.

<p align="center"> 
<img src="https://user-images.githubusercontent.com/33080863/43033177-3b6466f4-8ce3-11e8-8c6a-7efca76d1043.png">
</p>

## Modules
### [Collectors](https://github.com/tensult/cloud-reports/tree/master/src/collectors)
These collect the information about various cloud resources from the cloud provider. This information later used by [Analyzers](https://github.com/tensult/cloud-reports/tree/master/src/analyzers) to analyze.
### [Analyzers](https://github.com/tensult/cloud-reports/tree/master/src/analyzers)
Analyzers are the codified best practices for the cloud and these analyzes each best practice against the collected information and generates report which then consumed by [Reporters](https://github.com/tensult/cloud-reports/tree/master/src/reporters) to generate reports in a desired format.
### [Reporters](https://github.com/tensult/cloud-reports/tree/master/src/reporters)
These are for generating reports in various formats and currently supported formats are JSON, HTML and PDF.
### AWS (Amazon Web Services)
We are implementing checks based on [AWS Well Architected](https://aws.amazon.com/architecture/well-architected/) best practices. 
* [AWS Collectors](https://github.com/tensult/cloud-reports/tree/master/src/collectors/aws): Collects information from various AWS services.
* [AWS Analyzers](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws): Analyzes the information collected.
* Currently supported AWS service modules:
* * acm: [AWS Certificate Manager](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/acm)
* * apigateway: [Amazon APIGateway](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/apigateway)
* * cloudwatch: [AWS CloudWatch](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/cloudwatch)
* * dynamodb: [AWS DynamoDB](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/dynamodb)
* * ebs: [AWS Elastic Block Storage](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/ebs)
* * ec2: [AWS Elastic Cloud Computing](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/ec2)
* * elasticsearch: [AWS Elasticsearch Service](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/elasticsearch)
* * elb: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/elb)
* * iam: [AWS Identity and Access Management](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/iam)
* * lambda: [Amazon Lambda](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/lambda)
* * rds: [AWS Relational Databases](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/rds)
* * redshift: [AWS Redshift](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/redshift)
* * route53: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/elb)
* * s3: [AWS Simple Storage Service](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/s3)
* * sns: [AWS Simple Notification Service](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/snss)
* * route53: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/elb)
* * trails: [AWS CloudTrails](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/trails)
* * vpc: [AWS CloudTrails](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws/vpc)

### Install NodeJS
This package is based on NodeJS framework so you can it install from [here](https://nodejs.org/en/).
### Installing cloud-reports from source
#### Download

    git clone https://github.com/tensult/cloud-reports.git

#### Install npm dependencies
    cd cloud-reports
    npm install

#### Building
To convert typescript to javascript

    npm run build 
#### Scan
This collects and analyzes information about your AWS cloud and stores as a report file with name **scan_report.pdf**.
* To run for all modules
```
npm run scan -- --profile Your-AWS-profile
```
* To run for specific module
```
npm run scan -- --profile Your-AWS-profile --module s3,acm
```
* To run for single module
```
npm run scan -- --profile Your-AWS-profile  --module s3
```
* We can generate report in following formats: 
* To generate HTML report file
```
npm run scan -- --profile Your-AWS-profile  -f html
```
* To generate PDF report file
```
npm run scan -- --profile Your-AWS-profile  -f pdf
```
* To generate JSON report file
```
npm run scan -- --profile Your-AWS-profile  -f json
```
#### [Sample reports](https://github.com/tensult/cloud-reports/tree/master/sample-reports)

### Debugging
You can run this tool in debug mode to generate intermediate reports: collector_report.json and analyzer_report.json
```
npm run scan -- --profile Your-AWS-profile  -f pdf -d
```
#### Reusing Collector report
When we are working on analyzers, we will be testing them multiple times and every time collecting data will cause delays, to avoid such delays you can use the following command to reuse already collected collector report.
```
npm run scan -- --profile Your-AWS-profile  -f pdf -d -u
```
### Install as npm module to an existing package
#### Install cloud-reports npm module
```
npm install -S cloud-reports
```
#### Usage
Make sure you have initialized [AWS.config](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/global-config-object.html), otherwise this will use default AWS profile.
```js
    const cloudReporter = require('cloud-reports');
    // To collect for all modules
    const collectionPromise = cloudReporter.collect()
    // To collect for specific modules
    // const collectedJson = cloudReporter.collect(['s3', 'iam']);
    // const collectedJson = cloudReporter.collect('vpc');
    const analysisPromise = collectionPromise.then((collectedJson) => cloudReporter.analyze(collectedJson));
    analysisPromise.then((analysisJson) => console.log(JSON.stringify(analysisJson, null, 2)));
```
### Update service regions
We have written a [script](https://github.com/tensult/cloud-reports/blob/master/src/scripts/updateAwsServiceRegionsData.js) which updates the [AWS regions data](https://github.com/tensult/cloud-reports/blob/master/src/utils/aws/regions_data.ts)
```
node src/scripts/updateAwsServiceRegionsData.js
```
## Contribute
Currently this application only supports AWS, but can be extendable to other cloud providers. Contributions are most welcome.
