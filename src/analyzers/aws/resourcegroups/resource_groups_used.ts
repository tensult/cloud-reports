import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ResourceGroupsUsageAnalyzer extends BaseAnalyzer {
    public  checks_what : string ="Are Resource groups used to track the AWS resources?";
    public  checks_why : string =`Resource groups helps to track various AWS resources
    using Tags like Department, team, project etc`;
    public  checks_recommendation :string =`Recommended use Resource groups to track and monitor
    the AWS resources for better management of AWS services`;
    public  checks_name : string ="Number of ResourceGroups";
    public analyze(params: any, fullReport?: any): any {
        const allResourceGroups = params.resource_groups;
        if (!allResourceGroups) {
            return undefined;
        }
        const resource_groups_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        resource_groups_used.what = this.checks_what;
        resource_groups_used.why = this.checks_why;
        resource_groups_used.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allResourceGroups) {
            const regionResourceGroups = allResourceGroups[region];
            allRegionsAnalysis[region] = [];
            const resourceGroupAnalysis: IResourceAnalysisResult = {};
            resourceGroupAnalysis.resource = regionResourceGroups;
            resourceGroupAnalysis.resourceSummary = {
                name: this.checks_name,
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
