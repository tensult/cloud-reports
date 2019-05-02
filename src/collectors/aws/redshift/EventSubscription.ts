import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftEventSubscriptions extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllEventSubscriptions();
    }

    private async getAllEventSubscriptions() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const EventSubscriptions = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                EventSubscriptions[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftEventSubscriptions:
                        AWS.Redshift.Types.EventSubscriptionsMessage = await redshift.describeEventSubscriptions
                            ({ Marker: marker }).promise();
                        console.log("---->>>>",RedshiftEventSubscriptions);
                        EventSubscriptions[region] = EventSubscriptions[region].concat(RedshiftEventSubscriptions.EventSubscriptionsList);
                    marker = RedshiftEventSubscriptions.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { EventSubscriptions };
    }
}
