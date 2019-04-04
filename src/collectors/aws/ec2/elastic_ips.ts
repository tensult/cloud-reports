import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElasticIPsCollector extends BaseCollector {
    public collect() {
        return this.getAllElasticIPs();
    }

    private async getAllElasticIPs() {

        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const elastic_ips = {};

        for (const region of ec2Regions) {
            try {
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const elasticIPsResponse: AWS.EC2.DescribeAddressesResult = await ec2.describeAddresses().promise();
                if (elasticIPsResponse && elasticIPsResponse.Addresses) {
                    elastic_ips[region] = elasticIPsResponse.Addresses;
                }
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { elastic_ips };
    }
}
