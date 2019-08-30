import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigServiceConfigAggregatorsCollector extends BaseCollector {
    public collect() {
        return this.getAllConfigAggregators();
    }

    private async getAllConfigAggregators() {
        const self = this;
        const serviceName = "ConfigService";
        const configServiceRegions = self.getRegions(serviceName);
        const configurationAggregators = {};
        for (const region of configServiceRegions) {
            try {
                const configservice = self.getClient(serviceName, region) as AWS.ConfigService;
                configurationAggregators[region] = [];
                let fetchPending = true;
                let Token: undefined | string;
                while (fetchPending) {
                    const configAggregatorResponse:
                        AWS.ConfigService.Types.DescribeConfigurationAggregatorsResponse =
                        await configservice.describeConfigurationAggregators
                            ({ NextToken: Token }).promise();
                    configurationAggregators[region] =
                        configurationAggregators[region].concat(configAggregatorResponse.ConfigurationAggregators);
                    Token = configAggregatorResponse.NextToken;
                    fetchPending = Token !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                if (error !== "AccessDeniedException: null") {
                    AWSErrorHandler.handle(error);
                }
            }
        }
        return { configurationAggregators };
    }
}
