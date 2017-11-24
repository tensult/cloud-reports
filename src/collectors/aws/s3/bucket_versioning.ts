import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { BucketsCollector } from './buckets';
import { CollectorUtil } from "../../../utils";

export class BucketVersioningCollector extends BaseCollector {
    collect() {
        return this.listAllBucketVersionings();
    }

    private async listAllBucketVersionings() {
        const s3 = this.getClient('S3', 'us-east-1') as AWS.S3;
        const bucketsData = await CollectorUtil.cachedCollect(new BucketsCollector());
        let bucket_versioning = {};
        for (let bucket of bucketsData.buckets) {
            let s3BucketVersioning: AWS.S3.GetBucketVersioningOutput = await s3.getBucketVersioning({ Bucket: bucket.Name }).promise();
            bucket_versioning[bucket.Name] = s3BucketVersioning;
        }
        return { bucket_versioning };
    }
}
