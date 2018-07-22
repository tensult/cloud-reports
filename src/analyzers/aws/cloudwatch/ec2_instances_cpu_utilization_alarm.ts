import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class EC2InstanceCPUUtilizationAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.ec2'] || !fullReport['aws.ec2'].instances) {
            return undefined;
        }
        const allInstances: any[] = fullReport['aws.ec2'].instances;

        const ec2_instance_cpu_utilization_alarms: CheckAnalysisResult = { type: [CheckAnalysisType.OperationalExcellence] };
        ec2_instance_cpu_utilization_alarms.what = "Are alarms are enabled for EC2 instance CPU utilization?";
        ec2_instance_cpu_utilization_alarms.why = "It is important to set alarms for EC2 CPU utilization as when utilization is high then the application performance will be degraded."
        ec2_instance_cpu_utilization_alarms.recommendation = "Recommended to set alarm for EC2 CPU utilization to take appropriative action.";
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
                
                if (this.isCPUUtilizationAlarmPresent(instanceAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "CPUUtilization alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "CPUUtilization alarm is not enabled";
                    alarmAnalysis.action = 'Set CPUUtilization alarm';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        ec2_instance_cpu_utilization_alarms.regions = allRegionsAnalysis;
        return { ec2_instance_cpu_utilization_alarms };
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

    private isCPUUtilizationAlarmPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName === 'CPUUtilization';
        });
    }
}