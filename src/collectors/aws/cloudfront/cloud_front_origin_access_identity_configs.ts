import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { IdentityCollector } from "./cloud_front_origin_access_identity";

export class IdentityConfigsCollector extends BaseCollector {
    public collect() {
        return this.listAllCloudFrontOriginAccessIdentityConfigs();
    }

    private async listAllCloudFrontOriginAccessIdentityConfigs() {
        try {
            const identity = this.getClient("CloudFront", "us-east-1") as AWS.CloudFront;
            const identityCollector = new IdentityCollector();
            identityCollector.setSession(this.getSession());
            const identityData = await CollectorUtil.cachedCollect(identityCollector);
            const cloud_front_configs = {};
            for (const identity of identityData.identity) {
                const identityDistributionsData:
                    AWS.CloudFront.GetDistributionConfigResult =
                    await identity.getDistributionConfig({ Id: identity.Id }).promise();
                    cloud_front_configs[identity.Id] = identityDistributionsData.DistributionConfig;
                await CommonUtil.wait(200);
            }
            return { cloud_front_configs };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
