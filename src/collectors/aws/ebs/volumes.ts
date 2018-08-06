import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class VolumesCollector extends BaseCollector {
    collect() {
        return this.getAllVolumes();
    }

    private async getAllVolumes() {

        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const volumes = {};

        for (let region of ec2Regions) {
            try {
                let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                volumes[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const volumesResponse: AWS.EC2.DescribeVolumesResult = await ec2.describeVolumes({ NextToken: marker }).promise();
                    if (volumesResponse.Volumes) {
                        volumes[region] = volumes[region].concat(volumesResponse.Volumes);
                    }
                    marker = volumesResponse.NextToken;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { volumes };
    }
}