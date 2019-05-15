import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CloudTrailsEncryptionAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are Cloud trails encrypted at rest?";
    public  checks_why : string = "Critical data should always be encrypted at rest";
    public checks_recommendation : string = "Recommended to enable encryption at rest for CloudTrails";
    public checks_name : string = "CloudTrail";
    public analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_encryption_at_rest: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        cloud_trails_encryption_at_rest.what =this.checks_what;
        cloud_trails_encryption_at_rest.why =this.checks_why;
        cloud_trails_encryption_at_rest.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTrails) {
            const regionTrails = allTrails[region];
            allRegionsAnalysis[region] = [];
            for (const trail of regionTrails) {
                const trail_analysis: IResourceAnalysisResult = {};
                trail_analysis.resource = trail;
                trail_analysis.resourceSummary = {
                    name: this.checks_name, value: trail.Name,
                };
                if (trail.KmsKeyId) {
                    trail_analysis.severity = SeverityStatus.Good;
                    trail_analysis.message = "Encryption enabled";
                } else {
                    trail_analysis.severity = SeverityStatus.Failure;
                    trail_analysis.message = "Encryption not enabled";
                    trail_analysis.action = "Enable encryption at rest";
                }
                allRegionsAnalysis[region].push(trail_analysis);
            }
        }
        cloud_trails_encryption_at_rest.regions = allRegionsAnalysis;
        return { cloud_trails_encryption_at_rest };
    }
}
