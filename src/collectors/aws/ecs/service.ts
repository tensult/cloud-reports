import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";


export class ECSServiceCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllServices();
    }

    private async getAllServices() {

        const self = this;
        const serviceName = "ECS";
        const ecsRegions = self.getRegions(serviceName);
        const serviceList = {};

        for (const region of ecsRegions) {
            try {
                const ecs = self.getClient(serviceName, region) as AWS.ECS;
                serviceList[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const serviceResponse:
                        AWS.ECS.Types.DescribeServicesResponse = await ecs.describeServices
                            ({ services:["string"] }).promise();
                            serviceList[region] = serviceList[region].concat(serviceResponse.services);
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { serviceList };
    }
}
