import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class SecurityGroupsCollector extends BaseCollector {
    async collect() {
        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const security_groups = {};
        for (let region of ec2Regions) {
            try {
                let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const securityGroupsResponse: AWS.EC2.DescribeSecurityGroupsResult = await ec2.describeSecurityGroups().promise();
                security_groups[region] = securityGroupsResponse.SecurityGroups;
            } catch(error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { security_groups };
    }
}