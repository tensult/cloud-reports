import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class Alb5xxAlarmsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.elb'] || !fullReport['aws.elb'].elbs) {
            return undefined;
        }
        const allELBs: any[] = fullReport['aws.elb'].elbs;

        const alb_5xx_errors_alarm: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        alb_5xx_errors_alarm.what = "Are alarms are enabled for ALB 5XX errors?";
        alb_5xx_errors_alarm.why = "It is important to set alarms for 5xx Errors as otherwise you won't be aware when the application is failing"
        alb_5xx_errors_alarm.recommendation = "Recommended to set alarm for 5xx Errors to take appropriative action.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allELBs) {
            let regionELBs = allELBs[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByELB = this.mapAlarmsByELB(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let elb of regionELBs) {
                let alarmAnalysis: ResourceAnalysisResult = {};
                let elbAlarms =  alarmsMapByELB[this.getLoadBalancerDimensionId(elb.LoadBalancerArn)];
                console.log(elbAlarms);
                alarmAnalysis.resource = {elb, alarms: elbAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'LoadBalancer',
                    value: elb.LoadBalancerName
                }
            
                if (this.is5xxAlarmsPresent(elbAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "5XX errors alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Failure;
                    alarmAnalysis.message = "5XX errors alarms are not enabled";
                    alarmAnalysis.action = 'Set 5XX errors alarms';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        alb_5xx_errors_alarm.regions = allRegionsAnalysis;
        return { alb_5xx_errors_alarm };
    }

    private mapAlarmsByELB(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Namespace === 'AWS/ApplicationELB' && alarm.Dimensions) {
                const elbDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === 'LoadBalancer';
                });
                if(elbDimension && elbDimension.Value) {
                    alarmsMap[elbDimension.Value] = alarmsMap[elbDimension.Value] || [];
                    alarmsMap[elbDimension.Value].push(alarm);

                }
            }
            return alarmsMap;
        }, {});
    }

    private is5xxAlarmsPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName.toLowerCase().includes("5xx");
        });
    }

    private getLoadBalancerDimensionId(loadBalancerArn: string) {
        return loadBalancerArn.split("/").slice(-3).join("/");
    }
}