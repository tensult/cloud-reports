import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class CloudFrontOriginAccessIdentityCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listCloudFrontOriginAccessIdentities();
  }

  private async listCloudFrontOriginAccessIdentities() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      let fetchPending = true;
      let marker: string | undefined;
      let cloud_front_origin_access_identity: AWS.CloudFront.CloudFrontOriginAccessIdentitySummary[] = [];
      while (fetchPending) {
        const cloudfront_origin_access_Data: AWS.CloudFront.ListCloudFrontOriginAccessIdentitiesResult = await cloudfront
          .listCloudFrontOriginAccessIdentities({ Marker: marker })
          .promise();
        if (
          cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList &&
          cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList.Items
        ) {
          cloud_front_origin_access_identity = cloud_front_origin_access_identity.concat(
            cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList
              .Items
          );
          marker =
            cloudfront_origin_access_Data.CloudFrontOriginAccessIdentityList
              .NextMarker;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        } else {
          fetchPending = false;
        }
      }
      return { cloud_front_origin_access_identity };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
