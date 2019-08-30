import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2AvailabilityZonesCollector extends BaseCollector {
    public async collect(callback: (err?: Error, data?: any) => void) {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const availability_zones = {};

        for (const region of ec2Regions) {
            try {
                availability_zones[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const availabilityZonesResponse: AWS.EC2.DescribeAvailabilityZonesResult =
                    await ec2.describeAvailabilityZones().promise();
                availability_zones[region] =
                    availability_zones[region].concat(availabilityZonesResponse.AvailabilityZones);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { availability_zones };
    }
}
