import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class ResourceGroupsUsageAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allResourceGroups = params.resource_groups;
        if (!allResourceGroups) {
            return undefined;
        }
        const resource_groups_used: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        resource_groups_used.what = "Are Resource groups used to track the AWS resources?";
        resource_groups_used.why = "Resource groups helps to track various AWS resources using Tags like Department, team, project etc"
        resource_groups_used.recommendation = "Recommended use Resource groups to track and monitor the AWS resources for better management of AWS services";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allResourceGroups) {
            let regionResourceGroups = allResourceGroups[region];
            allRegionsAnalysis[region] = [];
            let resourceGroupAnalysis: ResourceAnalysisResult = {};
            resourceGroupAnalysis.resource = regionResourceGroups;
            resourceGroupAnalysis.resourceSummary = {
                name: 'Number of ResourceGroups',
                value: `${regionResourceGroups.length}`
            }
            if (regionResourceGroups && regionResourceGroups.length) {
                resourceGroupAnalysis.severity = SeverityStatus.Good;
                resourceGroupAnalysis.message = "Resource groups are used"
            } else {
                resourceGroupAnalysis.severity = SeverityStatus.Warning;
                resourceGroupAnalysis.message = "Resource groups are not used"
                resourceGroupAnalysis.action = 'Use Resource groups to track and monitor the AWS resources';
            }
            allRegionsAnalysis[region].push(resourceGroupAnalysis);
        }

        resource_groups_used.regions = allRegionsAnalysis;
        return { resource_groups_used };
    }
}