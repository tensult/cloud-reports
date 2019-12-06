import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EMRSecurityConfigurationCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllSecurityConfiguration();
    }

    private async getAllSecurityConfiguration() {

        const self = this;

        const serviceName = "EMR";
        const emrRegions = self.getRegions(serviceName);
        const securityConfiguration = {};

        for (const region of emrRegions) {
            try {
                const emr = self.getClient(serviceName, region) as AWS.EMR;
                securityConfiguration[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const securityConfigurationResponse:
                        AWS.EMR.Types.ListSecurityConfigurationsOutput = await emr.listSecurityConfigurations
                            ({ Marker: marker }).promise();
                    securityConfiguration[region] = securityConfiguration[region].concat(securityConfigurationResponse.Marker);
                    marker = securityConfigurationResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { securityConfiguration };
    }
}
