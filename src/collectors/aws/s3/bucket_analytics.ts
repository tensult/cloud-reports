import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { BucketsCollector } from './buckets';
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class BucketAnalyticsCollector extends BaseCollector {
    collect() {
        return this.listAllBucketAnalytics();
    }

    private async listAllBucketAnalytics() {
        const s3 = this.getClient('S3', 'us-east-1') as AWS.S3;
        const bucketsCollector =  new BucketsCollector();
        bucketsCollector.setSession(this.getSession());
        const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
        let bucket_analytics = {};
        for (let bucket of bucketsData.buckets) {
            bucket_analytics[bucket.Name] = [];
            let fetchPending = true;
            let marker: string | undefined = undefined;
            try {
                while (fetchPending) {
                    let s3BucketAnalyticsConfigOutput: AWS.S3.ListBucketAnalyticsConfigurationsOutput = await s3.listBucketAnalyticsConfigurations({ Bucket: bucket.Name, ContinuationToken: marker }).promise();
                    bucket_analytics[bucket.Name] = bucket_analytics[bucket.Name].concat(s3BucketAnalyticsConfigOutput.AnalyticsConfigurationList);
                    marker = s3BucketAnalyticsConfigOutput.NextContinuationToken;
                    fetchPending = marker !== undefined;
                }
            } catch (err) {
                AWSErrorHandler.handle(err);
            }
        }
        return { bucket_analytics };
    }
}
