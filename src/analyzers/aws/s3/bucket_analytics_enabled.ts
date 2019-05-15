import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class BucketAnalyticsAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Is S3 Bucket Analytics enabled?";
    public  checks_why : string =  `Bucket Analytics gives insights into how
    object are being accessed and using this information we can get life cycle rule to reduce cost.`;
    public analyze(params: any): any {
        const allBucketAnalyticsConfig = params.bucket_analytics;
        if (!allBucketAnalyticsConfig) {
            return undefined;
        }
        const bucket_analytics_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        bucket_analytics_enabled.what = this.checks_what;
        bucket_analytics_enabled.why =this.checks_why;
        bucket_analytics_enabled.recommendation = "Recommended to enable Analytics for all buckets";
        const allBucketsAnalysis: IResourceAnalysisResult[] = [];
        for (const bucketName in allBucketAnalyticsConfig) {
            const bucket_analysis: IResourceAnalysisResult = {};
            bucket_analysis.resource = { bucketName, bucketAnalyticsConfig: allBucketAnalyticsConfig[bucketName] };
            bucket_analysis.resourceSummary = {
                name: "Bucket", value: bucketName,
            };
            if (allBucketAnalyticsConfig[bucketName].length > 0) {
                bucket_analysis.severity = SeverityStatus.Good;
                bucket_analysis.message = "Bucket Analytics is already enabled";
            } else {
                bucket_analysis.severity = SeverityStatus.Warning;
                bucket_analysis.message = "Bucket Analytics is not enabled";
                bucket_analysis.action = "Enable Bucket Analytics";
            }
            allBucketsAnalysis.push(bucket_analysis);
        }
        bucket_analytics_enabled.regions = { global: allBucketsAnalysis };
        return { bucket_analytics_enabled };
    }
}
