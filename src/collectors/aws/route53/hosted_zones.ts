import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class HostedZonesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.listAllHostedZones();
  }

  private async listAllHostedZones() {
    try {
      const route53 = this.getClient("Route53", "us-east-1") as AWS.Route53;
      let fetchPending = true;
      let marker: string | undefined;
      let hosted_zones: AWS.Route53.HostedZone[] = [];
      while (fetchPending) {
        const route53HostedZonesData: AWS.Route53.ListHostedZonesResponse = await route53
          .listHostedZones({ Marker: marker })
          .promise();
        hosted_zones = hosted_zones.concat(route53HostedZonesData.HostedZones);
        marker = route53HostedZonesData.NextMarker;
        fetchPending = marker !== undefined;
        await CommonUtil.wait(200);
      }
      return { hosted_zones };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
