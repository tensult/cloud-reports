import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { ElbV2sCollector } from "./elbs"
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class ElbV2ListenersCollector extends BaseCollector {
    collect() {
        return this.getAllElbListeners();
    }

    private async getAllElbListeners() {
        const self = this;
        const serviceName = 'ELBv2';
        const elbRegions = self.getRegions(serviceName);
        const elbV2sCollector = new ElbV2sCollector();
        elbV2sCollector.setSession(this.getSession());
        const elb_listeners = {};
        try {
            const elbsData = await CollectorUtil.cachedCollect(elbV2sCollector);
            const elbs = elbsData.elbs;
            for (let region of elbRegions) {
                try {
                    let elbService = self.getClient(serviceName, region) as AWS.ELBv2;
                    let regionElbs = elbs[region];
                    let allRegionElbListeners = {};
                    for (let elb of regionElbs) {
                        let regionElbListeners: AWS.ELBv2.DescribeListenersOutput = await elbService.describeListeners({ LoadBalancerArn: elb.LoadBalancerArn }).promise();
                        allRegionElbListeners[elb.LoadBalancerName] = regionElbListeners.Listeners;
                    }
                    elb_listeners[region] = allRegionElbListeners;
                } catch (error) {
                    AWSErrorHandler.handle(error);
                    continue;
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { elb_listeners };
    }
}