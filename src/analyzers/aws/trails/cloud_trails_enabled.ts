import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CloudTrailsEnabledAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Is cloud trails enabled for account?";
    public  checks_why : string = `Cloud trails helps understand who did what
    and this is utmost important when a security breach happens`;
    public analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        cloud_trails_enabled.what = this.checks_what;
        cloud_trails_enabled.why =this.checks_why;
        cloud_trails_enabled.recommendation = "Recommended to enable cloud trails for all regions";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTrails) {
            const regionTrails = allTrails[region];
            const trail_analysis: IResourceAnalysisResult = {};
            trail_analysis.resource = regionTrails;
            trail_analysis.resourceSummary = {
                name: "CloudTrails", value: this.getTrailNames(regionTrails),
            };
            if (regionTrails.length) {
                trail_analysis.severity = SeverityStatus.Good;
                trail_analysis.message = "Cloud trails are enabled";
            } else {
                trail_analysis.severity = SeverityStatus.Failure;
                trail_analysis.message = "Cloud trails are not enabled";
                trail_analysis.action = "Enable cloud trails for debugging various actions against your account";
            }
            allRegionsAnalysis[region] = [trail_analysis];
        }
        cloud_trails_enabled.regions = allRegionsAnalysis;
        return { cloud_trails_enabled };
    }

    private getTrailNames(trails: any[]): string {
        if (!trails || !trails.length) {
            return "None";
        }
        return trails.map((trail) => {
            return trail.Name;
        }).join(", ");
    }
}
