import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class TopicsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllTopics();
  }
  private async getAllTopics() {
    const serviceName = "SNS";
    const snsRegions = this.getRegions(serviceName);
    const topics = {};

    for (const region of snsRegions) {
      try {
        const sns = this.getClient(serviceName, region) as AWS.SNS;
        topics[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const topicsResponse: AWS.SNS.ListTopicsResponse = await sns
            .listTopics({ NextToken: marker })
            .promise();
          if (topicsResponse.Topics) {
            topics[region] = topics[region].concat(topicsResponse.Topics);
          }
          marker = topicsResponse.NextToken;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { topics };
  }
}
