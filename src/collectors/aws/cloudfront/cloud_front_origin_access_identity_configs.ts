import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { CloudFrontOriginAccessIdentityCollector } from "./cloud_front_origin_access_identity";

import { IDictionary } from "../../../types";

export class CloudFrontOriginAccessIdentityConfigsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllCloudFrontOriginAccessIdentityConfigs();
  }

  private async listAllCloudFrontOriginAccessIdentityConfigs() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      const cloud_front_origin_access_identity_Collector = new CloudFrontOriginAccessIdentityCollector();
      cloud_front_origin_access_identity_Collector.setSession(
        this.getSession()
      );
      const cloud_front_origin_access_identity_Data = await CollectorUtil.cachedCollect(
        cloud_front_origin_access_identity_Collector
      );
      const cloud_front_origin_access_identity_configs = {};
      for (const cloud_front_origin_access_identity of cloud_front_origin_access_identity_Data.cloud_front_origin_access_identity) {
        const Cloud_Front_Origin_Access_Identity_Data: AWS.CloudFront.GetCloudFrontOriginAccessIdentityResult = await cloudfront
          .getCloudFrontOriginAccessIdentityConfig({
            Id: cloud_front_origin_access_identity.Id
          })
          .promise();
        cloud_front_origin_access_identity_configs[
          cloud_front_origin_access_identity.Id
        ] =
          Cloud_Front_Origin_Access_Identity_Data.CloudFrontOriginAccessIdentity;
        await CommonUtil.wait(200);
      }
      return { cloud_front_origin_access_identity_configs };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
