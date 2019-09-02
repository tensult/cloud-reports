import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ConfigServiceDeliveryChannelsCollector extends BaseCollector {
    public collect() {
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
                const deliveryChannelResponse: AWS.ConfigService.Types.DescribeDeliveryChannelsResponse =
                    await configservice.describeDeliveryChannels
                        ({}).promise();
                delivery_channels[region] =
                    delivery_channels[region].concat(deliveryChannelResponse.DeliveryChannels);
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { delivery_channels };
    }
}
