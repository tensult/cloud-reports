import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class BucketLifeCycleRulesAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are S3 Bucket Life Cycle rules used?";
    public  checks_why: string =  `Bucket life cycle rules helps us to manage the S3 object storage by either
    transferring objects to cheaper storage class or deleting them.`;
    public checks_recommendation : string ="Recommended to configure life cycle rules for all buckets";
    public checks_name :string = "Bucket";
    public analyze(params: any): any {
        const allBucketLifeCycleRules = params.bucket_life_cycle_rules;
        if (!allBucketLifeCycleRules) {
            return undefined;
        }
        const bucket_life_cycle_rules_used: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        bucket_life_cycle_rules_used.what = this.checks_what;
        bucket_life_cycle_rules_used.why =this.checks_why;
        bucket_life_cycle_rules_used.recommendation = this.checks_recommendation;
        const allBucketsAnalysis: IResourceAnalysisResult[] = [];
        for (const bucketName in allBucketLifeCycleRules) {
            const bucket_analysis: IResourceAnalysisResult = {};
            bucket_analysis.resource = { bucketName, bucketLifeCycleRules: allBucketLifeCycleRules[bucketName] };
            bucket_analysis.resourceSummary = {
                name: this.checks_name, value: bucketName,
            };
            if (allBucketLifeCycleRules[bucketName] && allBucketLifeCycleRules[bucketName].length > 0) {
                bucket_analysis.severity = SeverityStatus.Good;
                bucket_analysis.message = "Bucket Life cycle rules are configured";
            } else {
                bucket_analysis.severity = SeverityStatus.Warning;
                bucket_analysis.message = "Bucket Life cycle rules are not configured";
                bucket_analysis.action = "Configure life cycle rules";
            }
            allBucketsAnalysis.push(bucket_analysis);
        }
        bucket_life_cycle_rules_used.regions = { global: allBucketsAnalysis };
        return { bucket_life_cycle_rules_used };
    }
}
