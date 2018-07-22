import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { BucketsCollector } from './buckets';
import { CollectorUtil } from "../../../utils";
import { LogUtil } from '../../../utils/log';

export class BucketLifecycleRulesCollector extends BaseCollector {
    collect() {
        return this.listAllBucketLifecylceRules();
    }

    private async listAllBucketLifecylceRules() {
        const s3 = this.getClient('S3', 'us-east-1') as AWS.S3;
        const bucketsData = await CollectorUtil.cachedCollect(new BucketsCollector());
        let bucket_life_cycle_rules = {};
        for (let bucket of bucketsData.buckets) {
            try {
                let s3BucketPolicy: AWS.S3.GetBucketLifecycleConfigurationOutput = await s3.getBucketLifecycleConfiguration({ Bucket: bucket.Name }).promise();
                bucket_life_cycle_rules[bucket.Name] = s3BucketPolicy.Rules;
            } catch (err) {
                if(err.code === 'NoSuchLifecycleConfiguration') {
                    bucket_life_cycle_rules[bucket.Name] = undefined;
                } else {
                    LogUtil.error(err);
                }
                continue;
            }
        }
        return { bucket_life_cycle_rules };
    }
}
