import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { ElbsCollector } from "./elbs"
import { CollectorUtil } from "../../../utils";
import { LogUtil } from '../../../utils/log';

export class ElbAttributesCollector extends BaseCollector {
    collect() {
        return this.getAllElbAttributes();
    }

    private async getAllElbAttributes() {
        const self = this;
        const serviceName = 'ELB';
        const elbRegions = self.getRegions(serviceName);
        const elbsData = await CollectorUtil.cachedCollect(new ElbsCollector());
        const elbs = elbsData.elbs;
        const elb_attributes = {};
        for (let region of elbRegions) {
            try {
                let elbService = self.getClient(serviceName, region) as AWS.ELB;
                let regionElbs = elbs[region];
                let allRegionElbAttributes = {};
                for (let elb of regionElbs) {
                    let regionElbAttributes: AWS.ELB.DescribeLoadBalancerAttributesOutput = await elbService.describeLoadBalancerAttributes({ LoadBalancerName: elb.LoadBalancerName }).promise();
                    allRegionElbAttributes[elb.LoadBalancerName] = regionElbAttributes.LoadBalancerAttributes;
                }
                elb_attributes[region] = allRegionElbAttributes;
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { elb_attributes };
    }
}