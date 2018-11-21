import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class ElbV2sCollector extends BaseCollector {
    collect() {
        return this.getAllElbs();
    }

    private async getAllElbs() {

        const self = this;

        const serviceName = 'ELBv2';
        const elbRegions = self.getRegions(serviceName);
        const elbs = {};

        for (let region of elbRegions) {
            try {
                let elb = self.getClient(serviceName, region) as AWS.ELBv2;
                elbs[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const elbsResponse: AWS.ELBv2.DescribeLoadBalancersOutput = await elb.describeLoadBalancers({ Marker: marker }).promise();
                    elbs[region] = elbs[region].concat(elbsResponse.LoadBalancers);
                    marker = elbsResponse.NextMarker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { elbs };
    }
}