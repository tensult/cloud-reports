import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { ESDomainNamesCollector } from "./domain_names";

import { IDictionary } from "../../../types";

export class ESDomainsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllDomains();
  }

  private async getAllDomains() {
    const serviceName = "ES";
    const esRegions = this.getRegions(serviceName);
    const esDomainNamesCollector = new ESDomainNamesCollector();
    esDomainNamesCollector.setSession(this.getSession());
    const domains = {};

    try {
      const domainNamesData = await CollectorUtil.cachedCollect(
        esDomainNamesCollector
      );
      const domainNames = domainNamesData.domain_names;

      for (const region of esRegions) {
        if (!domainNames[region]) {
          continue;
        }
        try {
          const es = this.getClient(serviceName, region) as AWS.ES;
          this.context[region] = region;
          const domainsResponse: AWS.ES.DescribeElasticsearchDomainsResponse = await es
            .describeElasticsearchDomains({ DomainNames: domainNames[region] })
            .promise();
          if (domainsResponse && domainsResponse.DomainStatusList) {
            domains[region] = domainsResponse.DomainStatusList;
          }
          await CommonUtil.wait(200);
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { domains };
  }
}
