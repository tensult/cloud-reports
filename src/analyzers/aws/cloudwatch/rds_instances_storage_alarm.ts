import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class RDSInstanceStorageAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.rds'] || !fullReport['aws.rds'].instances) {
            return undefined;
        }
        const allInstances: any[] = fullReport['aws.rds'].instances;

        const rds_instances_storage_alarm: CheckAnalysisResult = { type: [CheckAnalysisType.PerformanceEfficiency] };
        rds_instances_storage_alarm.what = "Are alarms are enabled for RDS instance Storage?";
        rds_instances_storage_alarm.why = "It is important to set alarms for RDS Storage as when there is no storage then the application will stop working."
        rds_instances_storage_alarm.recommendation = "Recommended to set alarm for RDS Storage to take appropriative action.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allInstances) {
            let regionInstances = allInstances[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByInstance = this.mapAlarmsByInstance(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let instance of regionInstances) {
                if(instance.DBInstanceStatus === 'stopped') {
                    continue;
                }
                let alarmAnalysis: ResourceAnalysisResult = {};
                let instanceAlarms =  alarmsMapByInstance[instance.DBInstanceIdentifier];
                alarmAnalysis.resource = {instance, alarms: instanceAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'DBInstance',
                    value: instance.DBInstanceIdentifier
                }
                
                if (this.isStorageAlarmPresent(instanceAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Storage alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Storage alarm is not enabled";
                    alarmAnalysis.action = 'Set Storage alarm';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        rds_instances_storage_alarm.regions = allRegionsAnalysis;
        return { rds_instances_storage_alarm };
    }

    private mapAlarmsByInstance(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Namespace === 'AWS/RDS' && alarm.Dimensions) {
                const instanceDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === 'DBInstanceIdentifier';
                });
                if(instanceDimension && instanceDimension.Value) {
                    alarmsMap[instanceDimension.Value] = alarmsMap[instanceDimension.Value] || [];
                    alarmsMap[instanceDimension.Value].push(alarm);

                }
            }
            return alarmsMap;
        }, {});
    }

    private isStorageAlarmPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName === 'FreeStorageSpace';
        });
    }
}