import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class ElasticIPsCollector extends BaseCollector {
    collect() {
        return this.getAllElasticIPs();
    }

    private async getAllElasticIPs() {

        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const elastic_ips = {};

        for (let region of ec2Regions) {
            try {
                let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const elasticIPsResponse: AWS.EC2.DescribeAddressesResult = await ec2.describeAddresses().promise();
                if (elasticIPsResponse && elasticIPsResponse.Addresses) {
                    elastic_ips[region] = elasticIPsResponse.Addresses
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { elastic_ips };
    }
}