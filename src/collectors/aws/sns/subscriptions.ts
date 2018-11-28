import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class SubscriptionsCollector extends BaseCollector {
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
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const subscriptionsResponse:
                        AWS.SNS.ListSubscriptionsResponse =
                        await sns.listSubscriptions({ NextToken: marker }).promise();
                    if (subscriptionsResponse.Subscriptions) {
                        subscriptions[region] = subscriptions[region].concat(subscriptionsResponse.Subscriptions);
                    }
                    marker = subscriptionsResponse.NextToken;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { subscriptions };
    }

}
