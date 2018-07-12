import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class SubscriptionsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllSubscriptions();
    }
    private async getAllSubscriptions() {

        const serviceName = 'SNS';
        const snsRegions = this.getRegions(serviceName);
        const subscriptions = {};

        for (let region of snsRegions) {
            try {
                let sns = this.getClient(serviceName, region) as AWS.SNS;
                subscriptions[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const subscriptionsResponse: AWS.SNS.ListSubscriptionsResponse = await sns.listSubscriptions({ NextToken: marker }).promise();
                    if (subscriptionsResponse.Subscriptions) {
                        subscriptions[region] = subscriptions[region].concat(subscriptionsResponse.Subscriptions);
                    }
                    marker = subscriptionsResponse.NextToken;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch (error) {
                console.error(error);
                continue;
            }
        }
        return { subscriptions };
    }

}

