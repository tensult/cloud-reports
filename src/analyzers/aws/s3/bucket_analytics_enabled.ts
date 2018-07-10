import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class BucketAnalyticsAnalyzer extends BaseAnalyzer {

    analyze(params: any): any {
        const allBucketAnalyticsConfig = params.bucket_analytics;
        if (!allBucketAnalyticsConfig) {
            return undefined;
        }
        const bucket_analytics_enabled: CheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        bucket_analytics_enabled.what = "Is S3 Bucket Analytics enabled?";
        bucket_analytics_enabled.why = "Bucket Analytics gives insights into how object are being accessed and using this information we can get life cycle rule to reduce cost."
        bucket_analytics_enabled.recommendation = "Recommended to enable Analytics for all buckets";
        const allBucketsAnalysis: ResourceAnalysisResult[] = [];
        for (let bucketName in allBucketAnalyticsConfig) {
            let bucket_analysis : ResourceAnalysisResult = {};
            bucket_analysis.resource = { bucketName, bucketAnalyticsConfig: allBucketAnalyticsConfig[bucketName]  };
            bucket_analysis.resourceSummary = {
                name: 'Bucket', value: bucketName
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