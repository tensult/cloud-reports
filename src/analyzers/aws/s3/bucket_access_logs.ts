import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType } from '../../../types';

export class CloudTrailsBucketAccessLogsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport: any): any {
        const allBucketAccessLogs = params.bucket_access_logs;
        if (!allBucketAccessLogs || !fullReport['aws.trails'] || !fullReport['aws.trails'].cloud_trails) {
            return undefined;
        }
        const allCloudTrails = fullReport['aws.trails'].cloud_trails;

        const bucket_access_logs: CheckAnalysisResult = {type: CheckAnalysisType.Security};
        bucket_access_logs.what = "Are access logs enabled for buckets containing Cloud Trails?";
        bucket_access_logs.recommendation = "Recommended to enable access logs for buckets containing Cloud Trails";
        const allBucketsAnalysis: ResourceAnalysisResult[] = [];
        const cloudTrailBuckets = this.getCloudTrailBuckets(allCloudTrails);
        for (let bucketName of cloudTrailBuckets) {
            let bucketAccessLogs = allBucketAccessLogs[bucketName];
            let bucketAnalysis: ResourceAnalysisResult = {};
            bucketAnalysis.resource = { bucketName, bucketAccessLogs};
            bucketAnalysis.resourceSummary = { name: 'Bucket', value: bucketName};
            if (bucketAccessLogs && bucketAccessLogs.LoggingEnabled) {
                bucketAnalysis.severity = SeverityStatus.Good;
                bucketAnalysis.message = 'Access logs are enabled';
            } else {
                bucketAnalysis.severity = SeverityStatus.Failure;
                bucketAnalysis.message = 'Access logs are not enabled';
                bucketAnalysis.action = "Enable access logs"
            }

            allBucketsAnalysis.push(bucketAnalysis);
        }
        bucket_access_logs.regions = {global: allBucketsAnalysis};
        return { bucket_access_logs };
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