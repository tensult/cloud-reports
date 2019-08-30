import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigServiceDiscoveredResourcesCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllDiscoveredResources();
    }

    private async getAllDiscoveredResources() {

        const self = this;
        const serviceName = "ConfigService";
        const configServiceRegions = self.getRegions(serviceName);
        const discovered_resources = {};

        for (const region of configServiceRegions) {
            try {
                const configservice = self.getClient(serviceName, region) as AWS.ConfigService;
                discovered_resources[region] = [];
                let fetchPending = true;
                let Token : undefined | string;
                while (fetchPending) {
                    const discoveredResourcesResponse:
                        AWS.ConfigService.Types.ListDiscoveredResourcesResponse = await configservice.listDiscoveredResources
                            ({ resourceType : "AWS::EC2::Instance"}).promise();
                        discovered_resources[region] = discovered_resources[region].concat(discoveredResourcesResponse.resourceIdentifiers);
                    await CommonUtil.wait(200);
                    fetchPending = Token !== undefined && Token !== null;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { discovered_resources };
    }
}
