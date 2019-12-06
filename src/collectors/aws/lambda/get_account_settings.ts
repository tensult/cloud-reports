import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class LambdaAccountSettingsCollector extends BaseCollector {
    public collect() {
        return this.getAllAccountSettings();
    }

    private async getAllAccountSettings() {

        const self = this;

        const serviceName = "Lambda";
        const lambdaRegions = self.getRegions(serviceName);
        const accounts = {};

        for (const region of lambdaRegions) {
            try {
                const lambda = self.getClient(serviceName, region) as AWS.Lambda;
                accounts[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const accountSettingResponse: AWS.Lambda.GetAccountSettingsResponse =
                        await lambda.getAccountSettings().promise();
                    accounts[region] = accounts[region].concat(accountSettingResponse.AccountUsage).concat(accountSettingResponse.AccountLimit);
                    fetchPending = marker !== undefined && marker !== null;
                    
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { accounts };
    }
}
