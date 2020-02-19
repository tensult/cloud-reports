import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class BucketsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.listAllBuckets();
  }

  private async listAllBuckets() {
    try {
      const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
      const s3BucketsData: AWS.S3.ListBucketsOutput = await s3
        .listBuckets()
        .promise();
      const buckets = s3BucketsData.Buckets;
      return { buckets };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
