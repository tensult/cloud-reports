import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { BucketsCollector } from './buckets';
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class BucketPoliciesCollector extends BaseCollector {
    collect() {
        return this.listAllBucketPolicies();
    }

    private async listAllBucketPolicies() {
        const s3 = this.getClient('S3', 'us-east-1') as AWS.S3;
        const bucketsCollector = new BucketsCollector();
        bucketsCollector.setSession(this.getSession());
        let bucket_policies = {};

        try {
            const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
            for (let bucket of bucketsData.buckets) {
                try {
                    let s3BucketPolicy: AWS.S3.GetBucketPolicyOutput = await s3.getBucketPolicy({ Bucket: bucket.Name }).promise();
                    bucket_policies[bucket.Name] = s3BucketPolicy.Policy;
                } catch (err) {
                    AWSErrorHandler.handle(err);
                    continue;
                }
            }
        } catch (err) {
            AWSErrorHandler.handle(err);
        }
        return { bucket_policies };
    }
}
