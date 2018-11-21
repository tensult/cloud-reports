import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class VpcsCollector extends BaseCollector {
    async collect() {
        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const self = this;
        const vpcs = {};
        for (let region of ec2Regions) {
            try {
                let ec2 = self.getClient(serviceName, region) as AWS.EC2;
                const vpcsResponse: AWS.EC2.DescribeVpcsResult = await ec2.describeVpcs().promise();
                vpcs[region] = vpcsResponse.Vpcs;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { vpcs };
    }
}