import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

import { IDictionary } from "../../../types";

export class BucketVersioningCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllBucketVersionings();
  }

  private async listAllBucketVersionings() {
    const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
    const bucketsCollector = new BucketsCollector();
    bucketsCollector.setSession(this.getSession());
    const bucket_versioning = {};
    try {
      const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
      for (const bucket of bucketsData.buckets) {
        try {
          const s3BucketVersioning: AWS.S3.GetBucketVersioningOutput = await s3
            .getBucketVersioning({ Bucket: bucket.Name })
            .promise();
          bucket_versioning[bucket.Name] = s3BucketVersioning;
        } catch (error) {
          AWSErrorHandler.handle(error);
        }
        await CommonUtil.wait(200);
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { bucket_versioning };
  }
}
