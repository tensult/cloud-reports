import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { ElbV2sCollector } from "./elbV2s"
import { CollectorUtil } from "../../../utils";

export class ElbV2AttributesCollector extends BaseCollector {
    collect() {
        return this.getAllElbAttributes();
    }

    private async getAllElbAttributes() {
        const serviceName = 'ELBv2';
        const elbRegions = this.getRegions(serviceName);
        const elbsData = await CollectorUtil.cachedCollect(new ElbV2sCollector());
        const elbs = elbsData.elbV2s;
        const elbV2_attributes = {};
        for (let region of elbRegions) {
            let elbService = this.getClient(serviceName, region) as AWS.ELBv2;
            let regionElbs = elbs[region];
            let allRegionElbAttributes = {};
            for (let elb of regionElbs) {
                let regionElbAttributes: AWS.ELBv2.DescribeLoadBalancerAttributesOutput = await elbService.describeLoadBalancerAttributes({ LoadBalancerArn: elb.LoadBalancerArn }).promise();
                allRegionElbAttributes[elb.LoadBalancerName] = regionElbAttributes.Attributes;
            }
            elbV2_attributes[region] = allRegionElbAttributes;
        }
        return { elbV2_attributes };
    }
}