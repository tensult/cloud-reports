import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { ElbV2sCollector } from "./elbs"
import { CollectorUtil } from "../../../utils";
import { LogUtil } from '../../../utils/log';

export class ElbV2ListenersCollector extends BaseCollector {
    collect() {
        return this.getAllElbListeners();
    }

    private async getAllElbListeners() {
        const self = this;
        const serviceName = 'ELBv2';
        const elbRegions = self.getRegions(serviceName);
        const elbsData = await CollectorUtil.cachedCollect(new ElbV2sCollector());
        const elbs = elbsData.elbs;
        const elb_listeners = {};
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
                LogUtil.error(error);
                continue;
            }
        }
        return { elb_listeners };
    }
}