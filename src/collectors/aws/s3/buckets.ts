import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class BucketsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllBuckets();
    }

    private async listAllBuckets() {
        const s3 = this.getClient('S3', 'us-east-1') as AWS.S3;
        let s3BucketsData: AWS.S3.ListBucketsOutput = await s3.listBuckets().promise();
        let buckets = s3BucketsData.Buckets;
        return { buckets };
    }
}