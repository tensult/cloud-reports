import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

import { IDictionary } from "../../../types";

export class BucketAccessLogsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllBucketAccessLogs();
  }

  private async listAllBucketAccessLogs() {
    const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
    const bucketsCollector = new BucketsCollector();
    bucketsCollector.setSession(this.getSession());
    const bucket_access_logs = {};
    try {
      const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
      for (const bucket of bucketsData.buckets) {
        try {
          const s3BucketAccessLogs: AWS.S3.GetBucketLoggingOutput = await s3
            .getBucketLogging({ Bucket: bucket.Name })
            .promise();
          bucket_access_logs[bucket.Name] = s3BucketAccessLogs;
        } catch (error) {
          AWSErrorHandler.handle(error);
        }
        await CommonUtil.wait(200);
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { bucket_access_logs };
  }
}
