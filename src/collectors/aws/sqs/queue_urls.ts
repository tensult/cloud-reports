import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class QueueUrlsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllQueues();
  }
  private async getAllQueues() {
    const serviceName = "SQS";
    const sqsRegions = this.getRegions(serviceName);
    const queue_urls = {};

    for (const region of sqsRegions) {
      try {
        const sqs = this.getClient(serviceName, region) as AWS.SQS;
        queue_urls[region] = [];
        this.context[region] = region;

        const queueUrlsResponse: AWS.SQS.ListQueuesResult = await sqs
          .listQueues()
          .promise();
        if (queueUrlsResponse.QueueUrls && queueUrlsResponse.QueueUrls.length) {
          queue_urls[region] = queueUrlsResponse.QueueUrls;
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
      }
      await CommonUtil.wait(200);
    }
    return { queue_urls };
  }
}
