import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class CloudTrailsEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        cloud_trails_enabled.what = "Is cloud trails enabled for account?";
        cloud_trails_enabled.why = "Cloud trails helps understand who did what and this is utmost important when a security breach happens"
        cloud_trails_enabled.recommendation = "Recommended to enable cloud trails for all regions";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allTrails) {
            let regionTrails = allTrails[region];
            let trail_analysis: ResourceAnalysisResult = {};
            trail_analysis.resource = regionTrails;
            trail_analysis.resourceSummary = {
                name: 'CloudTrails', value: this.getTrailNames(regionTrails)
            }
            if (regionTrails.length) {
                trail_analysis.severity = SeverityStatus.Good;
                trail_analysis.message = 'Cloud trails are enabled';
            } else {
                trail_analysis.severity = SeverityStatus.Failure;
                trail_analysis.message = 'Cloud trails are not enabled';
                trail_analysis.action = 'Enable cloud trails for debugging various actions against your account'
            }
            allRegionsAnalysis[region] = [trail_analysis];
        }
        cloud_trails_enabled.regions = allRegionsAnalysis;
        return { cloud_trails_enabled };
    }

    private getTrailNames(trails: any[]): string {
        return trails.map((trail) => {
            return trail.Name;
        }).join(", ");
    }
}