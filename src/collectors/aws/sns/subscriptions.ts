import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class SubscriptionsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllSubscriptions();
  }
  private async getAllSubscriptions() {
    const serviceName = "SNS";
    const snsRegions = this.getRegions(serviceName);
    const subscriptions = {};

    for (const region of snsRegions) {
      try {
        const sns = this.getClient(serviceName, region) as AWS.SNS;
        subscriptions[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const subscriptionsResponse: AWS.SNS.ListSubscriptionsResponse = await sns
            .listSubscriptions({ NextToken: marker })
            .promise();
          if (subscriptionsResponse.Subscriptions) {
            subscriptions[region] = subscriptions[region].concat(
              subscriptionsResponse.Subscriptions
            );
          }
          marker = subscriptionsResponse.NextToken;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { subscriptions };
  }
}
