import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class VolumesCollector extends BaseCollector {
    public collect() {
        return this.getAllVolumes();
    }

    private async getAllVolumes() {

        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const volumes = {};

        for (const region of ec2Regions) {
            try {
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                volumes[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const volumesResponse: AWS.EC2.DescribeVolumesResult = await ec2.describeVolumes({ NextToken: marker }).promise();
                    if (volumesResponse.Volumes) {
                        volumes[region] = volumes[region].concat(volumesResponse.Volumes);
                    }
                    marker = volumesResponse.NextToken;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { volumes };
    }
}
