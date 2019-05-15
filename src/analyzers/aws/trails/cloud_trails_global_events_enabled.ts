import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CloudTrailsGlobalEventsAnalyzer extends BaseAnalyzer {
    public  checks_what : string ="Are global service events included in CloudTrails?";
    public  checks_why : string = `We need to enable this option to keep
    track of events from global service like IAM`;
    public checks_recommendation : string = `Recommended to enable
    IncludeGlobalServiceEvents for CloudTrails`;
    public checks_name : string = "CloudTrail";
    public analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_global_service_events: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        cloud_trails_global_service_events.what = this.checks_what;
        cloud_trails_global_service_events.why = this.checks_why;
        cloud_trails_global_service_events.recommendation = this.checks_recommendation;
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
                if (trail.IncludeGlobalServiceEvents) {
                    trail_analysis.severity = SeverityStatus.Good;
                    trail_analysis.message = "Global service events are included";
                } else {
                    trail_analysis.severity = SeverityStatus.Failure;
                    trail_analysis.message = "Global service events are not included";
                    trail_analysis.action = "Enable IncludeGlobalServiceEvents";
                }
                allRegionsAnalysis[region].push(trail_analysis);
            }
        }
        cloud_trails_global_service_events.regions = allRegionsAnalysis;
        return { cloud_trails_global_service_events };
    }
}
