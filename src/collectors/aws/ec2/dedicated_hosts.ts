import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2DedicatedHostsCollector extends BaseCollector {
    public collect() {
        return this.getAllDedicatedHosts();
    }

    private async getAllDedicatedHosts() {

        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const dedicated_hosts = {};

        for (const region of ec2Regions) {
            try {
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const dedicatedHostsResponse: AWS.EC2.DescribeHostsResult =
                    await ec2.describeHosts().promise();
                if (dedicatedHostsResponse && dedicatedHostsResponse.Hosts) {
                    dedicated_hosts[region] = dedicatedHostsResponse.Hosts;
                }
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { dedicated_hosts };
    }
}
