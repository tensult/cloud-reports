import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigurationRecorderCollector extends BaseCollector {
    public collect() {
        return this.getAllConfigurationRecorder();
    }

    private async getAllConfigurationRecorder() {
        const self = this;
        const serviceName = "ConfigService";
        const Regions = self.getRegions(serviceName);
        const recorder = {};
        for (const region of Regions) {
            try {
                const configurationRecorder = self.getClient(serviceName, region) as AWS.ConfigService;
                recorder[region] = [];
                // let fetchPending = true;
                // let token: string | undefined;
                // while (fetchPending) {
                //     const configurationRecorderResponse:
                //         AWS.ConfigService.Types.DescribeConfigurationRecordersResponse =
                //         await configurationRecorder.describeConfigurationRecorders().promise();
                //     recorder[region] = recorder[region].concat(configurationRecorderResponse.ConfigurationRecorders);
                //     fetchPending = token !== undefined;
                //     await CommonUtil.wait(200);
                // }
                const configurationRecorderResponse:
                    AWS.ConfigService.Types.DescribeConfigurationRecordersResponse =
                    await configurationRecorder.describeConfigurationRecorders().promise();
                recorder[region] = recorder[region].concat(configurationRecorderResponse.ConfigurationRecorders);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { recorder };
    }
}
