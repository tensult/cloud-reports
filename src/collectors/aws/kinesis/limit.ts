import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class KinesisLimitCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllLimits();
    }

    private async getAllLimits() {
        const self = this;
        const serviceName = "Kinesis";
        const kinesisRegions = self.getRegions(serviceName);
        const limit = {};

        for (const region of kinesisRegions) {
            try {
                const Kinesis = self.getClient(serviceName, region) as AWS.Kinesis;
                limit[region] = [];
                const limitResponse:
                        AWS.Kinesis.Types.DescribeLimitsOutput = await Kinesis.describeLimits().promise();
                limit[region] = limit[region].concat(limitResponse.ShardLimit);
                await CommonUtil.wait(200);
                
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { limit };
    }
}