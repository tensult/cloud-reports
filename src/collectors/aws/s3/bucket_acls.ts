import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

import { IDictionary } from "../../../types";

export class BucketAclsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllBucketAcls();
  }

  private async listAllBucketAcls() {
    const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
    const bucketsCollector = new BucketsCollector();
    bucketsCollector.setSession(this.getSession());
    const bucket_acls = {};

    try {
      const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
      for (const bucket of bucketsData.buckets) {
        try {
          const s3BucketAcl: AWS.S3.GetBucketAclOutput = await s3
            .getBucketAcl({ Bucket: bucket.Name })
            .promise();
          bucket_acls[bucket.Name] = s3BucketAcl;
        } catch (error) {
          AWSErrorHandler.handle(error);
        }
        await CommonUtil.wait(200);
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { bucket_acls };
  }
}
