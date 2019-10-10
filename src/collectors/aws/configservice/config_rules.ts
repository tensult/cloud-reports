import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class configRulesCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllconfigRules();
    }
    private async getAllconfigRules() {
        const self = this;
        const serviceName = "ConfigService";
        const Regions = self.getRegions(serviceName);
        const rules = {};
        for (const region of Regions) {
            try {
                const configRules = self.getClient(serviceName, region) as AWS.ConfigService;
                rules[region] = [];
                let fetchPending = true;
                let token: string | undefined;
                while (fetchPending) {
                    const configRulesResponse: AWS.ConfigService.Types.DescribeConfigRulesResponse = await configRules.describeConfigRules
                    ({ NextToken: token }).promise();
                    rules[region] = rules[region].concat(configRulesResponse.ConfigRules);
                    fetchPending = token !== undefined;
                    await CommonUtil.wait(200);
                }
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { rules };
    }
}




