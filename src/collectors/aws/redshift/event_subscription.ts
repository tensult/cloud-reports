import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftEventSubscriptionCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllEventSubscription();
    }

    private async getAllEventSubscription() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const EventSubscription = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                EventSubscription[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftEventSubscriptionResponse:
                        AWS.Redshift.Types.EventSubscriptionsMessage = await redshift.describeEventSubscriptions
                            ({ Marker: marker }).promise();
                            EventSubscription[region] = EventSubscription[region].concat(RedshiftEventSubscriptionResponse.EventSubscriptionsList);
                    marker = RedshiftEventSubscriptionResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }        
        return { EventSubscription};
    }
}
