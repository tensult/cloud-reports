import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

import { IDictionary } from "../../../types";

export class BucketAnalyticsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllBucketAnalytics();
  }

  private async listAllBucketAnalytics() {
    const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
    const bucketsCollector = new BucketsCollector();
    bucketsCollector.setSession(this.getSession());
    const bucket_analytics = {};

    try {
      const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
      for (const bucket of bucketsData.buckets) {
        bucket_analytics[bucket.Name] = [];
        let fetchPending = true;
        let marker: string | undefined;
        try {
          while (fetchPending) {
            const s3BucketAnalyticsConfigOutput: AWS.S3.ListBucketAnalyticsConfigurationsOutput = await s3
              .listBucketAnalyticsConfigurations({
                Bucket: bucket.Name,
                ContinuationToken: marker
              })
              .promise();
            bucket_analytics[bucket.Name] = bucket_analytics[
              bucket.Name
            ].concat(s3BucketAnalyticsConfigOutput.AnalyticsConfigurationList);
            marker = s3BucketAnalyticsConfigOutput.NextContinuationToken;
            fetchPending = marker !== undefined;
            await CommonUtil.wait(200);
          }
        } catch (err) {
          AWSErrorHandler.handle(err);
        }
      }
    } catch (err) {
      AWSErrorHandler.handle(err);
    }
    return { bucket_analytics };
  }
}
