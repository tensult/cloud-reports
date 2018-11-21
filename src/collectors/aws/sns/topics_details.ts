import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { TopicsCollector } from "./topics"
import { CollectorUtil } from "../../../utils";
import { Dictionary } from '../../../types';
import { AWSErrorHandler } from '../../../utils/aws';

export class TopicsDetailsCollector extends BaseCollector {
    collect() {
        return this.getAllTopicDetails();
    }

    private async getAllTopicDetails() {

        const self = this;
        const serviceName = 'SNS';
        const snsRegions = self.getRegions(serviceName);
        const topicsCollector = new TopicsCollector();
        topicsCollector.setSession(this.getSession());
        const topicsData = await CollectorUtil.cachedCollect(topicsCollector);
        const topics: Dictionary<AWS.SNS.Topic[]> = topicsData.topics;
        const topics_details = {};
        for (let region of snsRegions) {
            try {
                let snsService = self.getClient(serviceName, region) as AWS.SNS;
                let regionTopics = topics[region];
                let allRegionTopicDetails: AWS.SNS.TopicAttributesMap[] = [];
                for (let topic of regionTopics) {
                    if (topic.TopicArn) {
                        let topicAttributeDetails: AWS.SNS.GetTopicAttributesResponse = await snsService.getTopicAttributes({ TopicArn: topic.TopicArn }).promise();
                        if (topicAttributeDetails.Attributes) {
                            topicAttributeDetails.Attributes['Policy'] = JSON.parse(topicAttributeDetails.Attributes['Policy']);
                            topicAttributeDetails.Attributes['EffectiveDeliveryPolicy'] = JSON.parse(topicAttributeDetails.Attributes['EffectiveDeliveryPolicy']);
                            allRegionTopicDetails.push(topicAttributeDetails.Attributes);
                        }
                    }
                }
                topics_details[region] = allRegionTopicDetails;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { topics_details };
    }
}