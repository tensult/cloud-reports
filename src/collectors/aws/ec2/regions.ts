import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2RegionsCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const regions = {};
        for (const region of ec2Regions) {
            try {
                regions[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const regionsResponse: AWS.EC2.DescribeRegionsResult = await ec2.describeRegions().promise();
                regions[region] = regions[region].concat(regionsResponse.Regions);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { regions };
    }
}
