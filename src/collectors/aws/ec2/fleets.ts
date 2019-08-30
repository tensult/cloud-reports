import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2FleetsCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const fleets = {};
        for (const region of ec2Regions) {
            try {
                fleets[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const fleetsResponse: AWS.EC2.DescribeFleetsResult = await ec2.describeFleets({}).promise();
                fleets[region] = fleets[region].concat(fleetsResponse.Fleets);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { fleets };
    }
}
