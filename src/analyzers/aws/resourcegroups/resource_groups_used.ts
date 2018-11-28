import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ResourceGroupsUsageAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allResourceGroups = params.resource_groups;
        if (!allResourceGroups) {
            return undefined;
        }
        const resource_groups_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        resource_groups_used.what = "Are Resource groups used to track the AWS resources?";
        resource_groups_used.why = `Resource groups helps to track various AWS resources
        using Tags like Department, team, project etc`;
        resource_groups_used.recommendation = `Recommended use Resource groups to track and monitor
        the AWS resources for better management of AWS services`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allResourceGroups) {
            const regionResourceGroups = allResourceGroups[region];
            allRegionsAnalysis[region] = [];
            const resourceGroupAnalysis: IResourceAnalysisResult = {};
            resourceGroupAnalysis.resource = regionResourceGroups;
            resourceGroupAnalysis.resourceSummary = {
                name: "Number of ResourceGroups",
                value: `${regionResourceGroups.length}`,
            };
            if (regionResourceGroups && regionResourceGroups.length) {
                resourceGroupAnalysis.severity = SeverityStatus.Good;
                resourceGroupAnalysis.message = "Resource groups are used";
            } else {
                resourceGroupAnalysis.severity = SeverityStatus.Warning;
                resourceGroupAnalysis.message = "Resource groups are not used";
                resourceGroupAnalysis.action = "Use Resource groups to track and monitor the AWS resources";
            }
            allRegionsAnalysis[region].push(resourceGroupAnalysis);
        }

        resource_groups_used.regions = allRegionsAnalysis;
        return { resource_groups_used };
    }
}
