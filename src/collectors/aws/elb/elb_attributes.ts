import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { ElbV2sCollector } from "./elbs";

import { IDictionary } from "../../../types";

export class ElbV2AttributesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllElbAttributes();
  }

  private async getAllElbAttributes() {
    const serviceName = "ELBv2";
    const elbRegions = this.getRegions(serviceName);
    const elbV2sCollector = new ElbV2sCollector();
    elbV2sCollector.setSession(this.getSession());
    const elb_attributes = {};
    try {
      const elbsData = await CollectorUtil.cachedCollect(elbV2sCollector);
      const elbs = elbsData.elbs;
      for (const region of elbRegions) {
        try {
          const elbService = this.getClient(serviceName, region) as AWS.ELBv2;
          const regionElbs = elbs[region];
          this.context[region] = region;

          const allRegionElbAttributes = {};
          for (const elb of regionElbs) {
            const regionElbAttributes: AWS.ELBv2.DescribeLoadBalancerAttributesOutput = await elbService
              .describeLoadBalancerAttributes({
                LoadBalancerArn: elb.LoadBalancerArn
              })
              .promise();
            allRegionElbAttributes[elb.LoadBalancerName] =
              regionElbAttributes.Attributes;
            await CommonUtil.wait(200);
          }
          elb_attributes[region] = allRegionElbAttributes;
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { elb_attributes };
  }
}
