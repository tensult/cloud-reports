import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

import { IDictionary } from "../../../types";

export class BucketLifecycleRulesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllBucketLifecylceRules();
  }

  private async listAllBucketLifecylceRules() {
    const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
    const bucketsCollector = new BucketsCollector();
    bucketsCollector.setSession(this.getSession());
    const bucket_life_cycle_rules = {};
    try {
      const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
      for (const bucket of bucketsData.buckets) {
        try {
          const s3BucketPolicy: AWS.S3.GetBucketLifecycleConfigurationOutput = await s3
            .getBucketLifecycleConfiguration({ Bucket: bucket.Name })
            .promise();
          bucket_life_cycle_rules[bucket.Name] = s3BucketPolicy.Rules;
        } catch (err) {
          if (err.code === "NoSuchLifecycleConfiguration") {
            bucket_life_cycle_rules[bucket.Name] = undefined;
          } else {
            AWSErrorHandler.handle(err);
          }
        }
        await CommonUtil.wait(200);
      }
    } catch (err) {
      AWSErrorHandler.handle(err);
    }
    return { bucket_life_cycle_rules };
  }
}
