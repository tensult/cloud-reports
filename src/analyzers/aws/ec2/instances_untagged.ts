import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class InstanceUntaggedAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!allInstances) {
            return undefined;
        }
        const untagged_instances: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        untagged_instances.what = "Are there EC2 any instances without tags?";
        untagged_instances.why = "Tags help to follow security practices easily";
        untagged_instances.recommendation = "Recommended to add tags to all instances";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    security_groups: instance.SecurityGroups,
                };
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (instance.Tags.length === 0) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "No tags";
                    instanceAnalysis.action = "Add tags for the instance";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Tags are present";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        untagged_instances.regions = allRegionsAnalysis;
        return { untagged_instances };
    }
}
