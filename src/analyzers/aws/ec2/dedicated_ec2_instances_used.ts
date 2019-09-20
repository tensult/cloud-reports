import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class DedicatedTenUsedEC2InstancesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allReservedInstances = params.reserved_instances;
        const allInstances = params.instances;
        if (!allInstances || !allInstances) {
            return undefined;
        }
        const dedicated_ec2_instances_used: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
       dedicated_ec2_instances_used.what = "Are there any default Instances used for EC2 instances?";
       dedicated_ec2_instances_used.why = `Default instances are open to world by
        default and can be used by anyone.`;
       dedicated_ec2_instances_used.recommendation = `Recommended to use dedicated instances as it is assigned to one person in particular
       and can be accessed by one person only. `;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionReservedInstances = allReservedInstances[region];
            const dedicatedEc2InstancesUsed = this.getDedicatedEc2InstancesUsed(regionReservedInstances);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                    reserved_instances: instance.reserved_instances,
                };
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId}`,
                };
                if (this.isDedicatedInstancesExist(dedicatedEc2InstancesUsed, instance.reserved_instances)) {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = "Default Instances are used.";
                    instanceAnalysis.action = "Use dedicated Instances instead of default instances.";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Dedicated Instances are used.";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
       dedicated_ec2_instances_used.regions = allRegionsAnalysis;
        return {dedicated_ec2_instances_used };
    }

    private getDedicatedEc2InstancesUsed(reservedInstances: any[]) {
        if (!reservedInstances) {
            return [];
        }
        return reservedInstances.filter((reservedInstances) => {
            return reservedInstances.InstanceName === "default";
        });
    }

    private isDedicatedInstancesExist(reservedInstances1, reservedInstances2) {
        if (!reservedInstances1 || !reservedInstances2) {
            return false;
        }
        const dedicatedInstances = reservedInstances1.filter((reservedInstances1) => {
            return reservedInstances2.filter((reservedInstances2) => {
                return reservedInstances1.Instance === reservedInstances2.Instance;
            }).length > 0;
        });
        return dedicatedInstances.length > 0;
    }
}
