import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ProtocolsWithHttpSubscriptionsAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any SNS protocol without HTTPS ?";
    public  checks_why : string = `Ensure that none of the Amazon SNS subscriptions created within your AWS account are using
     HTTP instead of HTTPS as delivery protocol in order to enforce SSL encryption for all subscription requests.`;
    public checks_recommendation : string = `Every SNS protocol should have
    proper HTTPS else you should remove it.`;
    public checks_name : string = "Protocol";
    public analyze(params: any, fullReport?: any): any {
        const allSubscriptions = params.subscriptions;
        const allTopics = params.topics;

        if (!allTopics || !allSubscriptions) {
            return undefined;
        }
        const protocols_without_https: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        protocols_without_https.what = this.checks_what;
        protocols_without_https.why = this.checks_why;
        protocols_without_https.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTopics) {
            const regionTopics = allTopics[region];
            const regionSubscriptionsMap = this.mapSubscriptionByTopicArn(allSubscriptions[region]);

            allRegionsAnalysis[region] = [];
            for (const protocol of regionTopics) {
                const protocol_analysis: IResourceAnalysisResult = {};
                const topicName = this.getTopicName(protocol.TopicArn);
                protocol_analysis.resource = { topicName, subscriptions: regionSubscriptionsMap[protocol.TopicArn, protocol.Protocol]};
                protocol_analysis.resourceSummary = {
                    name: this.checks_name, value: protocol.Protocol,
                };
                if (regionSubscriptionsMap[protocol.Protocol] == regionSubscriptionsMap["http"]) {
                    protocol_analysis.severity = SeverityStatus.Warning;
                    protocol_analysis.message = "Protocols doesn't have HTTPS.";
                    protocol_analysis.action = "Protocol should have HTTPS because it is not secure to have HTTP protocol."
                } else {
                    protocol_analysis.severity = SeverityStatus.Good;
                    protocol_analysis.message = "Protocol has HTTPS.";
                }

                allRegionsAnalysis[region].push(protocol_analysis);
            }
        }
        protocols_without_https.regions = allRegionsAnalysis;
        return { protocols_without_https };
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
