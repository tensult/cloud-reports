import { BaseAnalyzer } from '../../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult } from '../../../../types';

export class CloudTrailsEncryptionAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTrails = params.cloud_trails;
        if (!allTrails) {
            return undefined;
        }
        const cloud_trails_encryption_at_rest: CheckAnalysisResult = {};
        cloud_trails_encryption_at_rest.what = "Are Cloud trails encrypted at rest?";
        cloud_trails_encryption_at_rest.why = "Critical data should always be encrypted at rest"
        cloud_trails_encryption_at_rest.recommendation = "Recommended to enable encryption at rest for CloudTrails";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allTrails) {
            let regionTrails = allTrails[region];
            allRegionsAnalysis[region] = [];
            for (let trail of regionTrails) {
                let trail_analysis: ResourceAnalysisResult = {};
                trail_analysis.resource = trail;
                trail_analysis.resourceSummary = {
                    name: 'CloudTrail', value: trail.Name
                };
                if (trail.KmsKeyId) {
                    trail_analysis.severity = SeverityStatus.Good;
                    trail_analysis.message = 'Encryption enabled';
                } else {
                    trail_analysis.severity = SeverityStatus.Failure;
                    trail_analysis.message = 'Encryption not enabled';
                    trail_analysis.action = 'Enable encryption at rest'
                }
                allRegionsAnalysis[region].push(trail_analysis);
            }
        }
        cloud_trails_encryption_at_rest.regions = allRegionsAnalysis;
        return { cloud_trails_encryption_at_rest };
    }
}