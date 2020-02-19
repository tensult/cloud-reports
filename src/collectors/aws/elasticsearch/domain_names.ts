import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class ESDomainNamesCollector extends BaseCollector {
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
    const domain_names = {};

    for (const region of esRegions) {
      try {
        const es = this.getClient(serviceName, region) as AWS.ES;
        const domainsResponse: AWS.ES.ListDomainNamesResponse = await es
          .listDomainNames()
          .promise();
        this.context[region] = region;

        if (domainsResponse && domainsResponse.DomainNames) {
          domain_names[region] = domainsResponse.DomainNames.map(domain => {
            return domain.DomainName;
          });
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { domain_names };
  }
}
