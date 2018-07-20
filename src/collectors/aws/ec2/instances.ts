import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class EC2InstancesCollector extends BaseCollector {
    collect() {
        return this.getAllInstances();
    }

    private async getAllInstances() {

        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const instances = {};

        for (let region of ec2Regions) {
            try {
                let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                instances[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const instancesResponse: AWS.EC2.DescribeInstancesResult = await ec2.describeInstances({ NextToken: marker }).promise();
                    if (instancesResponse && instancesResponse.Reservations) {
                        instances[region] = instances[region].concat(
                            instancesResponse.Reservations.reduce((instancesFromReservations: AWS.EC2.Instance[], reservation) => {
                                if (!reservation.Instances) {
                                    return instancesFromReservations;
                                } else {
                                    return instancesFromReservations.concat(reservation.Instances);
                                }
                            }, []));
                        marker = instancesResponse.NextToken;
                        fetchPending = marker !== undefined && marker !== null;
                    } else {
                        fetchPending = false;
                    }
                }
            } catch (error) {
                console.error(error);
                continue;
            }
        }
        return { instances };
    }
}