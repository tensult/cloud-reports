import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigServiceDeliveryChannelsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllDeliveryChannels();
    }

    private async getAllDeliveryChannels() {

        const self = this;
        const serviceName = "ConfigService";
        const configServiceRegions = self.getRegions(serviceName);
        const delivery_channels = {};

        for (const region of configServiceRegions) {
            try {
                const configservice = self.getClient(serviceName, region) as AWS.ConfigService;
                delivery_channels[region] = [];
                let fetchPending = true;
                let marker : undefined | string;
                while (fetchPending) {
                    const deliveryChannelResponse:
                        AWS.ConfigService.Types.DescribeDeliveryChannelsResponse = await configservice.describeDeliveryChannels
                            ({}).promise();
                        delivery_channels[region] = delivery_channels[region].concat(deliveryChannelResponse.DeliveryChannels);
                        fetchPending = marker !== undefined && marker !== null;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { delivery_channels };
    }
}
