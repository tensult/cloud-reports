import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class EC2InstanceMemoryUsageAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.ec2'] || !fullReport['aws.ec2'].instances) {
            return undefined;
        }
        const allInstances: any[] = fullReport['aws.ec2'].instances;

        const ec2_instance_memory_usage_alarm: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        ec2_instance_memory_usage_alarm.what = "Are alarms are enabled for RAM (Memory) of EC2 instance?";
        ec2_instance_memory_usage_alarm.why = "It is important to set alarms for RAM (Memory) as otherwise suddenly your applications might be running slower."
        ec2_instance_memory_usage_alarm.recommendation = "Recommended to set alarm for RAM (Memory) of EC2 instances to take appropriative action.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByInstance = this.mapAlarmsByInstance(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                if(instance.State.Name !== 'running') {
                    continue;
                }
               
                let alarmAnalysis: ResourceAnalysisResult = {};
                let instanceAlarms =  alarmsMapByInstance[instance.InstanceId];
                alarmAnalysis.resource = {instance, alarms: instanceAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: `${ResourceUtil.getNameByTags(instance)} | ${instance.InstanceId}`
                }
            
                if (this.isMemoryAlarmsPresent(instanceAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Memory alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Memory alarms are not enabled";
                    alarmAnalysis.action = 'Set Memory usage alarms';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        ec2_instance_memory_usage_alarm.regions = allRegionsAnalysis;
        return { ec2_instance_memory_usage_alarm };
    }

    private mapAlarmsByInstance(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Namespace === 'AWS/EC2' && alarm.Dimensions) {
                const instanceDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === 'InstanceId';
                });
                if(instanceDimension && instanceDimension.Value) {
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
            alarm.MetricName.toLowerCase().startsWith("mem");
        });
    }
}