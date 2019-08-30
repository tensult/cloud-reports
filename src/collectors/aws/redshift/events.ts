import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftEvents extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllEvents();
    }

    private async getAllEvents() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const events = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                events[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const redshiftEvents:
                        AWS.Redshift.Types.EventsMessage = await redshift.describeEvents
                            ({ Marker: marker }).promise();
                        events[region] = events[region].concat(redshiftEvents.Events);
                    marker = redshiftEvents.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { events };
    }
}
