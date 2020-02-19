import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class ESReservedInstancesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllInstances();
  }

  private async getAllInstances() {
    const serviceName = "ES";
    const esRegions = this.getRegions(serviceName);
    const reserved_instances = {};

    for (const region of esRegions) {
      try {
        const es = this.getClient(serviceName, region) as AWS.ES;
        reserved_instances[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const instancesResponse: AWS.ES.DescribeReservedElasticsearchInstancesResponse = await es
            .describeReservedElasticsearchInstances({ NextToken: marker })
            .promise();
          if (
            instancesResponse &&
            instancesResponse.ReservedElasticsearchInstances
          ) {
            reserved_instances[region] = reserved_instances[region].concat(
              instancesResponse.ReservedElasticsearchInstances
            );
            marker = instancesResponse.NextToken;
            fetchPending = marker !== undefined && marker !== null;
            await CommonUtil.wait(200);
          } else {
            fetchPending = false;
          }
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { reserved_instances };
  }
}
