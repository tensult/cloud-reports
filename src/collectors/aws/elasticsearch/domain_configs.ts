import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { ESDomainNamesCollector } from "./domain_names";

import { IDictionary } from "../../../types";

export class ESDomainConfigsCollector extends BaseCollector {
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
    const domain_configs = {};

    try {
      const domainNamesData = await CollectorUtil.cachedCollect(
        esDomainNamesCollector
      );
      const domainNames = domainNamesData.domain_names;

      for (const region of esRegions) {
        if (!domainNames[region] || !domainNames[region].length) {
          continue;
        }

        try {
          const es = this.getClient(serviceName, region) as AWS.ES;
          domain_configs[region] = {};
          this.context[region] = region;

          for (const domainName of domainNames[region]) {
            const domainConfigResponse: AWS.ES.DescribeElasticsearchDomainConfigResponse = await es
              .describeElasticsearchDomainConfig({ DomainName: domainName })
              .promise();
            if (domainConfigResponse && domainConfigResponse.DomainConfig) {
              domain_configs[region][domainName] =
                domainConfigResponse.DomainConfig;
            }
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
    return { domain_configs };
  }
}
