import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigServiceRetentionConfigsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllRetentionConfigs();
    }

    private async getAllRetentionConfigs() {

        const self = this;
        const serviceName = "Config";
        const configServiceRegions = self.getRegions(serviceName);
        const retention_configs = {};

        for (const region of configServiceRegions) {
            try {
                const configservice = self.getClient(serviceName, region) as AWS.ConfigService;
                retention_configs[region] = [];
                let fetchPending = true;
                let token: undefined | string;
                while (fetchPending) {
                    const retentionConfigResponse: AWS.ConfigService.Types.DescribeRetentionConfigurationsResponse =
                        await configservice.describeRetentionConfigurations
                            ({}).promise();
                    retention_configs[region] =
                        retention_configs[region].concat(retentionConfigResponse.RetentionConfigurations);
                    token = retentionConfigResponse.NextToken;
                    fetchPending = token !== undefined && token !== null;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { retention_configs };
    }
}
