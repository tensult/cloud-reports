import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class ElbV2sCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllElbs();
  }

  private async getAllElbs() {
    const self = this;

    const serviceName = "ELBv2";
    const elbRegions = self.getRegions(serviceName);
    const elbs = {};

    for (const region of elbRegions) {
      try {
        const elb = self.getClient(serviceName, region) as AWS.ELBv2;
        elbs[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const elbsResponse: AWS.ELBv2.DescribeLoadBalancersOutput = await elb
            .describeLoadBalancers({ Marker: marker })
            .promise();
          elbs[region] = elbs[region].concat(elbsResponse.LoadBalancers);
          marker = elbsResponse.NextMarker;
          fetchPending = marker !== undefined;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { elbs };
  }
}
