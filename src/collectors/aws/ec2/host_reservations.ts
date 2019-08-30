import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2HostReservationsCollector extends BaseCollector {
    public collect() {
        return this.getAllHostReservation();
    }
    private async getAllHostReservation() {

        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const host_reservations = {};

        for (const region of ec2Regions) {
            try {
                host_reservations[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const hostReservationsResponse: AWS.EC2.DescribeHostReservationsResult =
                    await ec2.describeHostReservations().promise();
                host_reservations[region] =
                    host_reservations[region].concat(hostReservationsResponse.HostReservationSet);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { host_reservations };
    }
}
