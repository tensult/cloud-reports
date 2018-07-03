import { BaseAnalyzer } from '../../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus } from '../../../../types';

export class CloudTrailsBucketAccessLogsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport: any): any {
        const allBucketAccessLogs = fullReport['aws.s3'].bucket_access_logs;
        const allCloudTrails = params.cloud_trails;
        if (!allBucketAccessLogs || !allCloudTrails) {
            return undefined;
        }
        const cloud_trails_bucket_access_logs: CheckAnalysisResult = {};
        cloud_trails_bucket_access_logs.what = "Are access logs enabled for buckets containing Cloud Trails?";
        cloud_trails_bucket_access_logs.why = "Cloud trails contains important security information so we need to limit access to them and also enable access logs for such buckets"
        cloud_trails_bucket_access_logs.recommendation = "Recommended to enable access logs for buckets containing Cloud Trails";
        const allBucketsAnalysis: ResourceAnalysisResult[] = [];
        const cloudTrailBuckets = this.getCloudTrailBuckets(allCloudTrails);
        for (let bucketName of cloudTrailBuckets) {
            let bucketAccessLogs = allBucketAccessLogs[bucketName];
            let bucketAnalysis: ResourceAnalysisResult = {};
            bucketAnalysis.resource = { bucketName, bucketAccessLogs};
            bucketAnalysis.resourceSummary = { name: 'Bucket', value: bucketName};
            if (bucketAccessLogs.LoggingEnabled) {
                bucketAnalysis.severity = SeverityStatus.Good;
                bucketAnalysis.message = 'Access logs are enabled';
            } else {
                bucketAnalysis.severity = SeverityStatus.Failure;
                bucketAnalysis.message = 'Access logs are not enabled';
                bucketAnalysis.action = "Enable access logs"
            }

            allBucketsAnalysis.push(bucketAnalysis);
        }
        cloud_trails_bucket_access_logs.regions = {global: allBucketsAnalysis};
        return { cloud_trails_bucket_access_logs };
    }

    getCloudTrailBuckets(cloudTrails) {
        const s3Buckets: any = {};
        for(let region in cloudTrails) {
            cloudTrails[region].forEach(trail => {
                s3Buckets[trail.S3BucketName] = 1;
            });
        }
        return Object.keys(s3Buckets);
    }
}