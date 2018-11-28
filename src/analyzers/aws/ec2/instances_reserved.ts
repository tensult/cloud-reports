import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { CommonUtil, ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class EC2InstancesReservationAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instances;
        const allReservedInstances = params.reserved_instances;
        if (!allInstances || !allReservedInstances) {
            return undefined;
        }
        const instances_reserved: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        instances_reserved.what = "Are there any long running instances which should be reserved?";
        instances_reserved.why = `You can reserve the EC2 instance which
        are you going to run for long time to save the cost.`;
        instances_reserved.recommendation = "Recommended to reserve all long running instances";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            const instanceCountMap = this.getCountOfInstancesReservedByInstanceType(allReservedInstances[region]);
            for (const instance of regionInstances) {
                if (instance.State.Name !== "running") {
                    continue;
                }
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = instance;
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId}`,
                };

                const runningFromDays = CommonUtil.daysFrom(instance.LaunchTime);

                if (this.getInstancesReservedCount(instanceCountMap, instance.InstanceType) === 1) {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Instance is reserved";
                } else {
                    if (runningFromDays > 365) {
                        instanceAnalysis.severity = SeverityStatus.Warning;
                    } else {
                        instanceAnalysis.severity = SeverityStatus.Info;
                    }
                    instanceAnalysis.message = `Instance is running from ${runningFromDays} days`;
                    instanceAnalysis.action = "Reserve the instance to save costs";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        instances_reserved.regions = allRegionsAnalysis;
        return { instances_reserved };
    }

    private getCountOfInstancesReservedByInstanceType(reservedInstances) {
        if (!reservedInstances || !reservedInstances.length) {
            return {};
        }

        return reservedInstances.filter((reservedInstance) => {
            return reservedInstance.State === "active";
        }).reduce((instanceCountMap, reservedInstance) => {
            instanceCountMap[reservedInstance.InstanceType] =
                instanceCountMap[reservedInstance.InstanceType] || { actual: 0, used: 0 };
            instanceCountMap[reservedInstance.InstanceType].actual += reservedInstance.InstanceCount;
            return instanceCountMap;
        }, {});
    }

    private getInstancesReservedCount(instanceCountMap, instanceType) {
        const instanceCountObj = instanceCountMap[instanceType];
        if (!instanceCountObj) {
            return 0;
        }

        if (instanceCountObj.actual - instanceCountObj.used > 0) {
            instanceCountObj.used++;
            return 1;
        } else {
            return 0;
        }
    }

}
