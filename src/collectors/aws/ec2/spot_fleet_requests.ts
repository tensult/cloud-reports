import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2SpotFleetRequestsCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const spot_fleet_requests = {};

        for (const region of ec2Regions) {
            try {
                spot_fleet_requests[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const spotFleetRequestsResponse: AWS.EC2.DescribeSpotFleetRequestsResponse =
                    await ec2.describeSpotFleetRequests().promise();
                spot_fleet_requests[region] =
                    spot_fleet_requests[region].concat(spotFleetRequestsResponse.SpotFleetRequestConfigs);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { spot_fleet_requests };
    }
}
