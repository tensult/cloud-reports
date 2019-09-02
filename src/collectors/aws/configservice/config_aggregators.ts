import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigServiceConfigAggregatorsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllConfigAggregators();
    }

    private async getAllConfigAggregators() {

        const self = this;
        const serviceName = "ConfigService";
        const configServiceRegions = self.getRegions(serviceName);
        const configuration_aggregators = {};
        for (const region of configServiceRegions) {
            try {
                const configservice = self.getClient(serviceName, region) as AWS.ConfigService;
                configuration_aggregators[region] = [];
                let fetchPending = true;
                let Token : undefined | string;
                while (fetchPending) {
                    const configAggregatorResponse:
                        AWS.ConfigService.Types.DescribeConfigurationAggregatorsResponse = await configservice.describeConfigurationAggregators
                            ({NextToken: Token}).promise();
                            
                    configuration_aggregators[region] = configuration_aggregators[region].concat(configAggregatorResponse.ConfigurationAggregators);
                    Token=configAggregatorResponse.NextToken;
                    fetchPending = Token !== undefined;
                    await CommonUtil.wait(200);                   
                }         
            } catch (error) {
                if( error != "AccessDeniedException: null") {
                    AWSErrorHandler.handle(error);
                }
            }
        }
        return { configuration_aggregators };
    }
}
