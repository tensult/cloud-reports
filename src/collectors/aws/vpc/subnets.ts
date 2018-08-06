import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class SubnetsCollector extends BaseCollector {

    async collect() {
        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const self = this;
        const subnets = {};
        for (let region of ec2Regions) {
            try {
                let ec2 = self.getClient(serviceName, region) as AWS.EC2;
                const subnetsResponse: AWS.EC2.DescribeSubnetsResult = await ec2.describeSubnets().promise();
                subnets[region] = subnetsResponse.Subnets;
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { subnets };
    }
}