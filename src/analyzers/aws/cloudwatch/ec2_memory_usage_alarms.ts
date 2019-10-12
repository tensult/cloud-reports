import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class EC2InstanceMemoryUsageAlarmsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport["aws.ec2"] || !fullReport["aws.ec2"].instances) {
            return undefined;
        }
        const allInstances: any[] = fullReport["aws.ec2"].instances;

        const ec2_instance_memory_usage_alarms:
            ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        ec2_instance_memory_usage_alarms.what = "Are alarms are enabled for RAM (Memory) of EC2 instance?";
        ec2_instance_memory_usage_alarms.why = `It is important to set alarms for RAM (Memory) as otherwise
        suddenly your applications might be running slower.`;
        ec2_instance_memory_usage_alarms.recommendation = `Recommended to set alarm for RAM (Memory)
        of EC2 instances to take appropriative action.`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            const regionAlarms = allAlarms[region] || [];
            const alarmsMapByInstance = this.mapAlarmsByInstance(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                if (instance.State.Name !== "running") {
                    continue;
                }

                const alarmAnalysis: IResourceAnalysisResult = {};
                const instanceAlarms = alarmsMapByInstance[instance.InstanceId];
                alarmAnalysis.resource = { instance, alarms: instanceAlarms };
                alarmAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId}`,
                };

                if (this.isMemoryAlarmsPresent(instanceAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Memory alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Memory alarms are not enabled";
                    alarmAnalysis.action = "Set Memory usage alarms";
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        ec2_instance_memory_usage_alarms.regions = allRegionsAnalysis;
        return { ec2_instance_memory_usage_alarms };
    }

    private mapAlarmsByInstance(alarms: any[]): IDictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if (alarm.Dimensions) {
                const instanceDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === "InstanceId";
                });
                if (instanceDimension && instanceDimension.Value) {
                    alarmsMap[instanceDimension.Value] = alarmsMap[instanceDimension.Value] || [];
                    alarmsMap[instanceDimension.Value].push(alarm);

                }
            }
            return alarmsMap;
        }, {});
    }

    private isMemoryAlarmsPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled &&
                alarm.AlarmActions &&
                alarm.AlarmActions.length &&
                (alarm.MetricName.toLowerCase().includes("mem_") ||
                    alarm.MetricName.toLowerCase().includes("memory"));
        });
    }
}
