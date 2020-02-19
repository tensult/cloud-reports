import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

import { IDictionary } from "../../../types";

export class BucketPoliciesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllBucketPolicies();
  }

  private async listAllBucketPolicies() {
    const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
    const bucketsCollector = new BucketsCollector();
    bucketsCollector.setSession(this.getSession());
    const bucket_policies = {};

    try {
      const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
      for (const bucket of bucketsData.buckets) {
        try {
          const s3BucketPolicy: AWS.S3.GetBucketPolicyOutput = await s3
            .getBucketPolicy({ Bucket: bucket.Name })
            .promise();
          bucket_policies[bucket.Name] = s3BucketPolicy.Policy;
        } catch (err) {
          AWSErrorHandler.handle(err);
        }
        await CommonUtil.wait(200);
      }
    } catch (err) {
      AWSErrorHandler.handle(err);
    }
    return { bucket_policies };
  }
}
