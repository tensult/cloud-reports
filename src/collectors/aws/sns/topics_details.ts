import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { TopicsCollector } from "./topics";

export class TopicsDetailsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllTopicDetails();
  }

  private async getAllTopicDetails() {
    const self = this;
    const serviceName = "SNS";
    const snsRegions = self.getRegions(serviceName);
    const topicsCollector = new TopicsCollector();
    topicsCollector.setSession(this.getSession());
    const topics_details = {};
    try {
      const topicsData = await CollectorUtil.cachedCollect(topicsCollector);
      const topics: IDictionary<AWS.SNS.Topic[]> = topicsData.topics;
      for (const region of snsRegions) {
        try {
          const snsService = self.getClient(serviceName, region) as AWS.SNS;
          const regionTopics = topics[region];
          this.context[region] = region;

          const allRegionTopicDetails: AWS.SNS.TopicAttributesMap[] = [];
          for (const topic of regionTopics) {
            if (topic.TopicArn) {
              const topicAttributeDetails: AWS.SNS.GetTopicAttributesResponse = await snsService
                .getTopicAttributes({ TopicArn: topic.TopicArn })
                .promise();
              if (topicAttributeDetails.Attributes) {
                topicAttributeDetails.Attributes.Policy = JSON.parse(
                  topicAttributeDetails.Attributes.Policy
                );
                topicAttributeDetails.Attributes.EffectiveDeliveryPolicy = JSON.parse(
                  topicAttributeDetails.Attributes.EffectiveDeliveryPolicy
                );
                allRegionTopicDetails.push(topicAttributeDetails.Attributes);
              }
            }
            await CommonUtil.wait(200);
          }
          topics_details[region] = allRegionTopicDetails;
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { topics_details };
  }
}
