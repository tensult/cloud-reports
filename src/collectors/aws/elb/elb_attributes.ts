import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { ElbV2sCollector } from "./elbs"
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class ElbV2AttributesCollector extends BaseCollector {
    collect() {
        return this.getAllElbAttributes();
    }

    private async getAllElbAttributes() {
        const serviceName = 'ELBv2';
        const elbRegions = this.getRegions(serviceName);
        const elbV2sCollector = new ElbV2sCollector();
        elbV2sCollector.setSession(this.getSession());
        const elbsData = await CollectorUtil.cachedCollect(elbV2sCollector);
        const elbs = elbsData.elbs;
        const elb_attributes = {};
        for (let region of elbRegions) {
            try {
                let elbService = this.getClient(serviceName, region) as AWS.ELBv2;
                let regionElbs = elbs[region];
                let allRegionElbAttributes = {};
                for (let elb of regionElbs) {
                    let regionElbAttributes: AWS.ELBv2.DescribeLoadBalancerAttributesOutput = await elbService.describeLoadBalancerAttributes({ LoadBalancerArn: elb.LoadBalancerArn }).promise();
                    allRegionElbAttributes[elb.LoadBalancerName] = regionElbAttributes.Attributes;
                }
                elb_attributes[region] = allRegionElbAttributes;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { elb_attributes };
    }
}