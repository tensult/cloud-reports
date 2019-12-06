import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElastiCacheEventsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllEvents();
    }
    private async getAllEvents() {
        const self = this;
        const serviceName = "ElastiCache";
        const elasticacheRegions = self.getRegions(serviceName);
        const events = {};
        
        for (const region of elasticacheRegions) {
            try {
                const elasticache = self.getClient(serviceName, region) as AWS.ElastiCache;
                events[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const eventsResponse:
                        AWS.ElastiCache.Types.EventsMessage = await elasticache.describeEvents
                            ({ Marker: marker }).promise();
                        events[region] = events[region].concat(eventsResponse.Events);
                    marker = eventsResponse.Marker;
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