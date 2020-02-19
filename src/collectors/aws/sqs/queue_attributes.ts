import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { QueueUrlsCollector } from "./queue_urls";

export class QueueAttributesCollector extends BaseCollector {
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
    const queueUrlsCollector = new QueueUrlsCollector();
    queueUrlsCollector.setSession(this.getSession());
    const queue_attributes = {};
    try {
      const queueUrlsData = await CollectorUtil.cachedCollect(
        queueUrlsCollector
      );
      const queue_urls: IDictionary<string[]> = queueUrlsData.queue_urls;

      for (const region of sqsRegions) {
        try {
          const sqs = this.getClient(serviceName, region) as AWS.SQS;
          queue_attributes[region] = {};
          this.context[region] = region;

          this.context[region] = region;

          for (const queueUrl of queue_urls[region]) {
            const getQueueAttributesResult: AWS.SQS.GetQueueAttributesResult = await sqs
              .getQueueAttributes({
                QueueUrl: queueUrl,
                AttributeNames: ["All"]
              })
              .promise();
            if (getQueueAttributesResult.Attributes) {
              queue_attributes[region][queueUrl] =
                getQueueAttributesResult.Attributes;
            }
            await CommonUtil.wait(200);
          }
        } catch (error) {
          AWSErrorHandler.handle(error);
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { queue_attributes };
  }
}
