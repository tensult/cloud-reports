import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class CloudTrailsGlobalEventsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_global_service_events: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        cloud_trails_global_service_events.what = "Are global service events included in CloudTrails?";
        cloud_trails_global_service_events.why = `We need to enable this option to keep
        track of events from global service like IAM`;
        cloud_trails_global_service_events.recommendation = `Recommended to enable
        IncludeGlobalServiceEvents for CloudTrails`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTrails) {
            const regionTrails = allTrails[region];
            allRegionsAnalysis[region] = [];
            for (const trail of regionTrails) {
                const trail_analysis: IResourceAnalysisResult = {};
                trail_analysis.resource = trail;
                trail_analysis.resourceSummary = {
                    name: "CloudTrail", value: trail.Name,
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
