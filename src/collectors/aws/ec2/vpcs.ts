import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2VpcCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const vpcs = {};

        for (const region of ec2Regions) {
            try {
                vpcs[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const vpcsResponse: AWS.EC2.DescribeVpcsResult = await ec2.describeVpcs().promise();
                vpcs[region] = vpcs[region].concat(vpcsResponse.Vpcs);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { vpcs };
    }
}
