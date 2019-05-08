import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class OriginAccessCollector extends BaseCollector {
    public collect() {
        return this.listCloudFrontOriginAccessIdentities();
    }

    private async listCloudFrontOriginAccessIdentities() {
        try {
            const cloudfront = this.getClient("CloudFront", "us-east-1") as AWS.CloudFront;
            let fetchPending = true;
            let marker: string | undefined;
            let origin_access: AWS.CloudFront.CloudFrontOriginAccessIdentitySummary [] = [];
            while (fetchPending) {
                const cloudfront_origin_access_Data:
                    AWS.CloudFront.ListCloudFrontOriginAccessIdentitiesResult =
                    await cloudfront. listCloudFrontOriginAccessIdentities({ Marker: marker }).promise();
                if (cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList &&
                    cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList.Items) {
                    origin_access = origin_access.concat(cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList.Items);
                    marker = cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList.NextMarker;
                    fetchPending = marker !== undefined && marker !== null;
                    await CommonUtil.wait(200);
                } else {
                    fetchPending = false;
                }
            }
            return { origin_access };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
