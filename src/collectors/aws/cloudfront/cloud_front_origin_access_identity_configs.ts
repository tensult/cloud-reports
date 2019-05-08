import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { OriginAccessCollector } from "./cloud_front_origin_access_identity";

export class OriginAccessConfigsCollector extends BaseCollector {
    public collect() {
        return this.listAllCloudFrontOriginAccessIdentityConfigs();
    }

    private async listAllCloudFrontOriginAccessIdentityConfigs() {
        try {
            const cloudfront = this.getClient("CloudFront", "us-east-1") as AWS.CloudFront;
            const origin_access_Collector = new OriginAccessCollector();
            origin_access_Collector.setSession(this.getSession());
            const origin_access_Data = await CollectorUtil.cachedCollect(origin_access_Collector);
            const cloud_front_configs = {};
            for (const origin_access of origin_access_Data.origin_access) {
                const Origin_Access_Data:
                    AWS.CloudFront.GetCloudFrontOriginAccessIdentityResult =
                    await origin_access.getDistributionConfig({ Id: origin_access.Id }).promise();
                    cloud_front_configs[origin_access.Id] = Origin_Access_Data.CloudFrontOriginAccessIdentity;
                await CommonUtil.wait(200);
            }
            return { cloud_front_configs };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
