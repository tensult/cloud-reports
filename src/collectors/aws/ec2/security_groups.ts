import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class SecurityGroupsCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const security_groups = {};
        for (const region of ec2Regions) {
            try {
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const securityGroupsResponse: AWS.EC2.DescribeSecurityGroupsResult =
                    await ec2.describeSecurityGroups().promise();
                security_groups[region] = securityGroupsResponse.SecurityGroups;
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { security_groups };
    }
}
