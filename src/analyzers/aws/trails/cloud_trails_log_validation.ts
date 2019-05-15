import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CloudTrailsLogValidationAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Is log file validation enabled for cloud trails?";
    public  checks_why : string = `Cloud trails helps understand who did what so
    enabling log file validation keep their integrity intact`;
    public checks_recommendation : string = "Recommended to enable log file validation for all cloud trails";
    public checks_name : string = "CloudTrail";
    public analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_log_validation: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        cloud_trails_log_validation.what = this.checks_what;
        cloud_trails_log_validation.why = this.checks_why;
        cloud_trails_log_validation.recommendation = this.checks_recommendation;
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
                if (trail.LogFileValidationEnabled) {
                    trail_analysis.severity = SeverityStatus.Good;
                    trail_analysis.message = "Log validation is enabled for the cloud trail";
                } else {
                    trail_analysis.severity = SeverityStatus.Failure;
                    trail_analysis.message = "Log validation is not enabled for the cloud trail";
                    trail_analysis.action = "Enable cloud trail log validation for log file integrity";
                }
                allRegionsAnalysis[region].push(trail_analysis);
            }
        }
        cloud_trails_log_validation.regions = allRegionsAnalysis;
        return { cloud_trails_log_validation };
    }
}
