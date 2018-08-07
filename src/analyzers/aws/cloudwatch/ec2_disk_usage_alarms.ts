import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class EC2InstanceDiskUsageAlarmsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.ec2'] || !fullReport['aws.ec2'].instances) {
            return undefined;
        }
        const allInstances: any[] = fullReport['aws.ec2'].instances;

        const ec2_instance_disk_usage_alarms: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        ec2_instance_disk_usage_alarms.what = "Are alarms are enabled for Disks attached to EC2 instance?";
        ec2_instance_disk_usage_alarms.why = "It is important to set alarms for Disks as otherwise suddenly your applications might be down."
        ec2_instance_disk_usage_alarms.recommendation = "Recommended to set alarm for Disks to take appropriative action.";
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
            
                if (this.isDiskAlarmsPresent(instanceAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Disk alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Failure;
                    alarmAnalysis.message = "Disk alarms are not enabled";
                    alarmAnalysis.action = 'Set Disk usage alarms';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        ec2_instance_disk_usage_alarms.regions = allRegionsAnalysis;
        return { ec2_instance_disk_usage_alarms };
    }

    private mapAlarmsByInstance(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Dimensions) {
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

    private isDiskAlarmsPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName.toLowerCase().includes("disk");
        });
    }
}
