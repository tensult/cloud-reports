import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class KeyPairsCollector extends BaseCollector {
    async collect() {
        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const key_pairs = {};
        for (let region of ec2Regions) {
            try {
                let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const keyPairsResponse: AWS.EC2.DescribeKeyPairsResult = await ec2.describeKeyPairs().promise();
                key_pairs[region] = keyPairsResponse.KeyPairs;
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { key_pairs };
    }
}