# Cloud Reports
Collects info about various cloud resources and analyzes then against best practices and give a JSON, HTML or PDF reports.

## Modules
### [Collectors](https://github.com/tensult/cloud-reports/tree/master/src/collectors)
These collect the information about various cloud resources from the cloud provider. This information later used by [Analyzers](https://github.com/tensult/cloud-reports/tree/master/src/analyzers) to analyze.
### [Analyzers](https://github.com/tensult/cloud-reports/tree/master/src/analyzers)
Analyzers are the codified best practices for the cloud and these analyzes each best practice against the collected information and generates report which then consumed by [Reporters](https://github.com/tensult/cloud-reports/tree/master/src/reporters) to generate reports in a desired format.
### [Reporters](https://github.com/tensult/cloud-reports/tree/master/src/reporters)
These are for generating reports in various formats and currently supported formats are JSON, HTML and PDF.
### AWS (Amazon Web Services)
* [AWS Collectors](https://github.com/tensult/cloud-reports/tree/master/src/collectors/aws): Collects information from various AWS services.
* [AWS Analyzers](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/aws): Analyzes the information collected.
* Currently supported AWS service modules:
* * acm: [AWS Certificate Manager](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/acm)
* * ebs: [AWS Elastic Block Storage](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/ebs)
* * ec2: [AWS Elastic Cloud Computing](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/ec2)
* * elb: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/elb)
* * iam: [AWS Identity and Access Management](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/iam)
* * rds: [AWS Relational Databases](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/rds)
* * redshift: [AWS Redshift](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/redshift)
* * route53: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/elb)
* * s3: [AWS Simple Storage Service](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/s3)
* * route53: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/elb)
* * trails: [AWS CloudTrails](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/trails)
* * vpc: [AWS CloudTrails](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/vpc)

### Installation from source
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
We have written a [script](https://github.com/tensult/cloud-reports/blob/master/src/scripts/extractAwsServiceRegions.js) which updates the [AWS regions data](https://github.com/tensult/cloud-reports/blob/master/src/utils/aws/regions_data.ts)
```
node src/utils/aws/extractAwsServiceRegions.js
```
## Contribute
Currently this application only supports AWS, but can be extendable to other cloud providers. Contributions are most welcome.
