import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class EC2InstanceCPUUtilizationAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        const allInstances: any[] = fullReport['aws.ec2'].instances;
        if (!allAlarms || !allInstances) {
            return undefined;
        }
        const instance_cpu_utilization_alarm: CheckAnalysisResult = { type: [CheckAnalysisType.PerformanceEfficiency] };
        instance_cpu_utilization_alarm.what = "Are alarms are enabled for EC2 instance CPU utilization?";
        instance_cpu_utilization_alarm.why = "It is important to set alarms for EC2 CPU utilization as when utilization is high application performance will be degraded."
        instance_cpu_utilization_alarm.recommendation = "Recommended to set errors alarm for EC2 CPU utilization to take appropriative action.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByInstance = this.mapAlarmsByInstance(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                let alarmAnalysis: ResourceAnalysisResult = {};
                let instanceAlarms =  alarmsMapByInstance[instance.FunctionName];
                alarmAnalysis.resource = {instance, alarms: instanceAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'Instance',
                    value: instance.FunctionName
                }
                
                if (this.isErrorsAlarmPresent(instanceAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Errors alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Errors alarm is not enabled";
                    alarmAnalysis.action = 'Set Errors alarm';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        instance_cpu_utilization_alarm.regions = allRegionsAnalysis;
        return { instance_cpu_utilization_alarm };
    }

    private mapAlarmsByInstance(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Namespace === 'AWS/Lambda' && alarm.Dimensions) {
                const instanceDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === 'FunctionName';
                });
                if(instanceDimension && instanceDimension.Value) {
                    alarmsMap[instanceDimension.Value] = alarmsMap[instanceDimension.Value] || [];
                    alarmsMap[instanceDimension.Value].push(alarm);

                }
            }
            return alarmsMap;
        }, {});
    }

    private isErrorsAlarmPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName === 'Errors';
        });
    }
}