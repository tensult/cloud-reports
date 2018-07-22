import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class ElbsCollector extends BaseCollector {
    collect() {
        return this.getAllElbs();
    }

    private async getAllElbs() {

        const serviceName = 'ELB';
        const elbRegions = this.getRegions(serviceName);
        const elbs = {};

        for (let region of elbRegions) {
            try {
                let elb = this.getClient(serviceName, region) as AWS.ELB;
                elbs[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const elbsResponse: AWS.ELB.DescribeAccessPointsOutput = await elb.describeLoadBalancers({ Marker: marker }).promise();
                    if (elbsResponse.LoadBalancerDescriptions) {
                        elbs[region] = elbs[region].concat(elbsResponse.LoadBalancerDescriptions);
                    }
                    marker = elbsResponse.NextMarker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { elbs };
    }
}