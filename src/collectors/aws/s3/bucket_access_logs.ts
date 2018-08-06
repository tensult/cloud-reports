import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { BucketsCollector } from './buckets';
import { CollectorUtil } from "../../../utils";
import { LogUtil } from '../../../utils/log';

export class BucketAccessLogsCollector extends BaseCollector {
    collect() {
        return this.listAllBucketAccessLogs();
    }

    private async listAllBucketAccessLogs() {
        const s3 = this.getClient('S3', 'us-east-1') as AWS.S3;
        const bucketsData = await CollectorUtil.cachedCollect(new BucketsCollector());
        let bucket_access_logs = {};
        for (let bucket of bucketsData.buckets) {
            try {
                let s3BucketAccessLogs: AWS.S3.GetBucketLoggingOutput = await s3.getBucketLogging({ Bucket: bucket.Name }).promise();
                bucket_access_logs[bucket.Name] = s3BucketAccessLogs;
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { bucket_access_logs };
    }
}
