# Cloud Reports
Collects info about various cloud resources and analyzes then against best practices and give a JSON report.

## Modules
### AWS (Amazon Web Services)
* acm: [AWS Certificate Manager](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/acm)
* ebs: [AWS Elastic Block Storage](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/ebs)
* ec2: [AWS Elastic Cloud Computing](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/ec2)
* elb: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/elb)
* iam: [AWS Identity and Access Management](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/iam)
* rds: [AWS Relational Databases](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/rds)
* redshift: [AWS Redshift](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/redshift)
* route53: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/elb)
* s3: [AWS Simple Storage Service](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/s3)
* route53: [AWS Elastic Load Balancer](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/elb)
* trails: [AWS CloudTrails](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/trails)
* vpc: [AWS CloudTrails](https://github.com/tensult/cloud-reports/tree/master/src/analyzers/security/aws/vpc)

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
This collects and analyzes information about your AWS cloud and stores as a JSON file with name **scan_report.json**.
* To run for all modules

    npm run scan -- --profile Your-AWS-profile
* To run for specific module

    npm run scan -- --profile Your-AWS-profile --module s3,acm
* To run for single module

    npm run scan -- --profile Your-AWS-profile --module s3

### Install as npm module to an existing package
#### Install cloud-reports npm module
    npm install -S cloud-reports
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

## Contribute
Currently this application only supports AWS, but can be extendable to other cloud providers. Contributions are most welcome.
