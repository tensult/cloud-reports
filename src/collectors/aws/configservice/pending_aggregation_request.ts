import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class PendingAggregationRequestsCollector extends BaseCollector {
    public collect() {
        return this.getAllPendingAggregationRequests();
    }
    private async getAllPendingAggregationRequests() {
        const self = this;
        const serviceName = "ConfigService";
        const configserviceRegions = self.getRegions(serviceName);
        const pending_aggregation_requests = {};

        for (const region of configserviceRegions) {
            try {
                const confiservice = self.getClient(serviceName, region) as AWS.ConfigService;
                pending_aggregation_requests[region] = [];
                let fetchPending = true;
                let token: string | undefined;
                while (fetchPending) {
                    const pendingAggregationRequestsResponse:
                        AWS.ConfigService.Types.DescribePendingAggregationRequestsResponse =
                        await confiservice.describePendingAggregationRequests
                            ().promise();
                    pending_aggregation_requests[region] = pending_aggregation_requests[region].
                        concat(pendingAggregationRequestsResponse.PendingAggregationRequests);
                    token = pendingAggregationRequestsResponse.NextToken;
                    fetchPending = token !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { pending_aggregation_requests };
    }
}
