import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class DomainsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.listAllDomains();
  }

  private async listAllDomains() {
    try {
      const route53 = this.getClient(
        "Route53Domains",
        "us-east-1"
      ) as AWS.Route53Domains;
      let fetchPending = true;
      let marker: string | undefined;
      let domains: AWS.Route53Domains.DomainSummary[] = [];
      while (fetchPending) {
        const route53DomainsData: AWS.Route53Domains.ListDomainsResponse = await route53
          .listDomains({ Marker: marker })
          .promise();
        domains = domains.concat(route53DomainsData.Domains);
        marker = route53DomainsData.NextPageMarker;
        fetchPending = marker !== undefined;
        await CommonUtil.wait(200);
      }
      return { domains };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
