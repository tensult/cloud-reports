import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class DedicatedUsedEC2InstancesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        if (!fullReport["aws.instances"] || !fullReport["aws.instances"].instance || !allInstances) {
            return undefined;
        }
        const allinstance = fullReport["aws.instances"].instance;

        const dedicated_instance_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        dedicated_instance_used.what = "Are there any dedicated instances used for EC2 instances?";
        dedicated_instance_used.why = "Dedicated instance are not open to world and are secure but expensive";
        dedicated_instance_used.recommendation = `Recommended to use dedicated instances or create a custom one
        as they make you better understand the security posture but dedicated servers are more costlier then the shared one`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regioninstance = allinstance[region];
            const dedicatedinstance = this.getdedicatedinstance(regioninstance);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    instancesId: instance.instancesId,
                };
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (this.isinstancesExist(dedicatedinstance, instance.instancesId)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "Dedicated instances is not used";
                    instanceAnalysis.action = "Expenses decrease. Default instance is used.";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Dedicated instances is used";
                    instanceAnalysis.action= "Amount to be paid is +++";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        dedicated_instance_used.regions = allRegionsAnalysis;
        return { dedicated_instance_used };
    }

    private getdedicatedinstance(instance: any[]) {
        if (!instance) {
            return [];
        }
        return instance.filter((instances) => {
            return instances.Isdedicated;
        });
    }

    private isinstancesExist(instance, instancesId) {
        if (!instance || !instancesId) {
            return false;
        }
        return instance.filter((instances) => {
            return instances.instancesId === instancesId;
        }).length > 0;
    }
}
