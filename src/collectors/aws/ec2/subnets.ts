import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2SubnetsCollector extends BaseCollector {
    public async collect(callback: (err?: Error,data?: any)=>void) {
        
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const subnets = {};

        for (const region of ec2Regions) {
            try {
                subnets[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const subnetsResponse: AWS.EC2.DescribeSubnetsResult =
                    await ec2.describeSubnets({}).promise();
                subnets[region] = subnets[region].concat(subnetsResponse.Subnets);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { subnets };
    }
}
