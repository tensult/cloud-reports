import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2CapacityReservationsCollector extends BaseCollector {

    public collect() {
        return this.getAllCapacityReservations();
    }

    public async getAllCapacityReservations() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const capacity_reservations = {};
        for (const region of ec2Regions) {
            try {
                capacity_reservations[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const capacityReservationsResponse: AWS.EC2.DescribeCapacityReservationsResult =
                    await ec2.describeCapacityReservations().promise();
                capacity_reservations[region] =
                    capacity_reservations[region].concat(capacityReservationsResponse.CapacityReservations);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { capacity_reservations };
    }
}
