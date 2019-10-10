import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";


export class AggregationAuthorizationCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllAggregationAuthorization();
    }

    private async getAllAggregationAuthorization() {

        const self = this;
        const serviceName = "ConfigService";
        const aggregationRegions = self.getRegions(serviceName);
        const aggregationAuthorization = {};

        for (const region of aggregationRegions) { 
            try {
                const configService = self.getClient(serviceName, region) as AWS.ConfigService;
                aggregationAuthorization[region] = [];
                let fetchPending = true;
                let token: string | undefined;
                while (fetchPending) {
                    const aggregationAuthorizationResponse:
                        AWS.ConfigService.Types.DescribeAggregationAuthorizationsResponse = await configService.describeAggregationAuthorizations
                        ({NextToken : token}).promise();
                    aggregationAuthorization[region] = aggregationAuthorization[region].concat(aggregationAuthorizationResponse.AggregationAuthorizations);
                    fetchPending = token !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { aggregationAuthorization };
    }
}
