import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class NetworkAclsCollector extends BaseCollector {

    async collect() {
        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const self = this;
        const network_acls = {};
        for (let region of ec2Regions) {
            try {
                let ec2 = self.getClient(serviceName, region) as AWS.EC2;
                const networkAclsResponse: AWS.EC2.DescribeNetworkAclsResult = await ec2.describeNetworkAcls().promise();
                network_acls[region] = networkAclsResponse.NetworkAcls;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { network_acls };
    }
}