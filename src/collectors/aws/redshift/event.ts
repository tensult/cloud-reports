import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { aws } from "../../../analyzers";

export class RedshiftEventCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllEvent();
    }

    private async getAllEvent() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const Event = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                Event[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftEventResponse:
                        AWS.Redshift.Types.EventsMessage = await redshift.describeEvents
                            ({ Marker: marker }).promise();
                            Event[region] = Event[region].concat(RedshiftEventResponse.Events);
                    marker = RedshiftEventResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }        
        return { Event};
    }
}
