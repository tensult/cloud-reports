import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class ElbV2sCollector extends BaseCollector {
    collect() {
        return this.getAllElbs();
    }

    private async getAllElbs() {

        const self = this;

        const serviceName = 'ELBv2';
        const elbRegions = self.getRegions(serviceName);
        const elbV2s = {};

        for (let region of elbRegions) {
            let elb = self.getClient(serviceName, region) as AWS.ELBv2;
            elbV2s[region] = [];
            let fetchPending = true;
            let marker: string | undefined = undefined;
            while (fetchPending) {
                const elbsResponse: AWS.ELBv2.DescribeLoadBalancersOutput = await elb.describeLoadBalancers({ Marker: marker }).promise();
                elbV2s[region] = elbV2s[region].concat(elbsResponse.LoadBalancers);
                marker = elbsResponse.NextMarker;
                fetchPending = marker !== undefined;
            }
        }
        return { elbV2s };
    }
}