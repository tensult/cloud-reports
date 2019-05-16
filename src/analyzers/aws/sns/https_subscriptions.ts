import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class TopicsWithHttpsSubscriptionsAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any SNS topics without HTTPS subscriptions  ?";
    public  checks_why : string = `Ensure that none of the Amazon SNS subscriptions created within your AWS account are using
    HTTP instead of HTTPS as delivery protocol in order to enforce SSL encryption for all subscription requests.`;
    public checks_recommendation: string = `Every SNS topic should have
    proper subscriptions else you should remove it`
    public checks_name : string = "Topic";
    public analyze(params: any, fullReport?: any): any {
        const allSubscriptions = params.subscriptions;
        const allTopics = params.topics;

        if (!allTopics || !allSubscriptions) {
            return undefined;
        }
        const topics_with_https_subscriptions: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        topics_with_https_subscriptions.what = this.checks_what;
        topics_with_https_subscriptions.why = this.checks_why;
        topics_with_https_subscriptions.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTopics) {
            const regionTopics = allTopics[region];
            const regionSubscriptionsMap = this.mapSubscriptionByTopicArn(allSubscriptions[region]);

            allRegionsAnalysis[region] = [];
            for (const topic of regionTopics) {
                const topic_analysis: IResourceAnalysisResult = {};
                const topicName = this.getTopicName(topic.TopicArn);
                topic_analysis.resource = { topicName, subscriptions: regionSubscriptionsMap[topic.TopicArn] };
                topic_analysis.resourceSummary = {
                    name: this.checks_name, value: topicName,
                };
                if (regionSubscriptionsMap[topic.TopicArn] && regionSubscriptionsMap[topic.TopicArn].length) {
                    topic_analysis.severity = SeverityStatus.Good;
                    topic_analysis.message = "Topic has HTTPS subscriptions";
                } else {
                    topic_analysis.severity = SeverityStatus.Warning;
                    topic_analysis.message = "Topic does not have HTTPS subscriptions";
                    topic_analysis.action = "Either add HTTPS subscription or delete the topic";
                }

                allRegionsAnalysis[region].push(topic_analysis);
            }
        }
        topics_with_https_subscriptions.regions = allRegionsAnalysis;
        return { topics_with_https_subscriptions };
    }

    private mapSubscriptionByTopicArn(subscriptions: any[]): IDictionary<any[]> {
        return subscriptions.reduce((subscriptionsMap, subscription) => {
            subscriptionsMap[subscription.TopicArn] = subscriptionsMap[subscription.TopicArn] || [];
            subscriptionsMap[subscription.TopicArn].push(subscription);
            return subscriptionsMap;
        }, {});
    }

    private getTopicName(topicArn: string): string {
        return topicArn.split(":").pop() as string;
    }
}
