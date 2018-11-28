import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CloudTrailsBucketAccessLogsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport: any): any {
        const allBucketAccessLogs = params.bucket_access_logs;
        if (!allBucketAccessLogs || !fullReport["aws.trails"] || !fullReport["aws.trails"].cloud_trails) {
            return undefined;
        }
        const allCloudTrails = fullReport["aws.trails"].cloud_trails;

        const bucket_access_logs: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        bucket_access_logs.what = "Are access logs enabled for buckets containing Cloud Trails?";
        bucket_access_logs.recommendation = "Recommended to enable access logs for buckets containing Cloud Trails";
        const allBucketsAnalysis: IResourceAnalysisResult[] = [];
        const cloudTrailBuckets = this.getCloudTrailBuckets(allCloudTrails);
        for (const bucketName of cloudTrailBuckets) {
            const bucketAccessLogs = allBucketAccessLogs[bucketName];
            const bucketAnalysis: IResourceAnalysisResult = {};
            bucketAnalysis.resourceSummary = { name: "Bucket", value: bucketName };
            if (bucketAccessLogs && bucketAccessLogs.LoggingEnabled) {
                bucketAnalysis.resource = { bucketName, bucketAccessLogs };
                bucketAnalysis.severity = SeverityStatus.Good;
                bucketAnalysis.message = "Access logs are enabled";
            } else {
                bucketAnalysis.resource = { bucketName };
                bucketAnalysis.severity = SeverityStatus.Failure;
                bucketAnalysis.message = "Access logs are not enabled";
                bucketAnalysis.action = "Enable access logs";
            }

            allBucketsAnalysis.push(bucketAnalysis);
        }
        bucket_access_logs.regions = { global: allBucketsAnalysis };
        return { bucket_access_logs };
    }

    public getCloudTrailBuckets(cloudTrails) {
        const s3Buckets: any = {};
        for (const region in cloudTrails) {
            cloudTrails[region].forEach((trail) => {
                s3Buckets[trail.S3BucketName] = 1;
            });
        }
        return Object.keys(s3Buckets);
    }
}
