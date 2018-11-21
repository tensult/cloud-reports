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
        const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
        let bucket_policies = {};
        for (let bucket of bucketsData.buckets) {
            try {
                let s3BucketPolicy: AWS.S3.GetBucketPolicyOutput = await s3.getBucketPolicy({ Bucket: bucket.Name }).promise();
                bucket_policies[bucket.Name] = s3BucketPolicy.Policy;
            } catch (err) {
                AWSErrorHandler.handle(err);
                continue;
            }
        }
        return { bucket_policies };
    }
}
