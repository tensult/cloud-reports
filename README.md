# Cloud Reports
Currently this application only supports AWS, but can be extendable to other cloud providers. Contributions are most welcome.

## Modules
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

### Installation 

    npm install

### Execution

#### Building
To convert typescript to javascript

    npm run build 
#### Scan
This collects and analyzes information about your AWS cloud and stores as a JSON file with name **scan_report.json**.
* To run for all modules

    npm run scan -- --profile <your AWS profile>
* To run for specific module

    npm run scan -- --profile <your AWS profile> --module s3,acm
* To run for single module

    npm run scan -- --profile <your AWS profile> --module s3


