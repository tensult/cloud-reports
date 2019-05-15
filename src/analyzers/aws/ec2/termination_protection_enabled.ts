import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class EC2InstanceTerminationProtectionAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there any instances without termination protection?";
    public  checks_why : string = `Instances can be accidentally terminated and data
    can be lost when they are without termination protection`;
    public checks_recommendation : string = `Recommended to enable termination protection
        for all production critical instances` ;
    public checks_name : string = "Instance";
    public analyze(params: any, fullReport?: any): any {
        const allTerminationProtectionStatuses = params.termination_protection;
        const allInstances = params.instances;
        if (!allTerminationProtectionStatuses || !allInstances) {
            return undefined;
        }
        const termination_protection_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        termination_protection_enabled.what = this.checks_what;
        termination_protection_enabled.why = this.checks_why;
        termination_protection_enabled.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    termination_protection:
                        allTerminationProtectionStatuses[region][instance.InstanceId],
                };
                instanceAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (allTerminationProtectionStatuses[region][instance.InstanceId] &&
                    allTerminationProtectionStatuses[region][instance.InstanceId].Value) {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Already enabled";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Warning;
                    instanceAnalysis.message = "Not enabled";
                    instanceAnalysis.action = "Enable termination protection";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        termination_protection_enabled.regions = allRegionsAnalysis;
        return { termination_protection_enabled };
    }
}
