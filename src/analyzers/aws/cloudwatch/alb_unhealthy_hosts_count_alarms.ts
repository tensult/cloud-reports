import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class AlbUnHealthyHostAlarmsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.elb'] || !fullReport['aws.elb'].elbs) {
            return undefined;
        }
        const allELBs: any[] = fullReport['aws.elb'].elbs;

        const alb_unhealthy_hosts_alarms: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        alb_unhealthy_hosts_alarms.what = "Are alarms are enabled for ALB Unhealthy hosts?";
        alb_unhealthy_hosts_alarms.why = "It is important to set alarms for Unhealthy hosts as otherwise the performance of the application will be degraded"
        alb_unhealthy_hosts_alarms.recommendation = "Recommended to set alarm for Unhealthy hosts to take appropriative action.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allELBs) {
            let regionELBs = allELBs[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByELB = this.mapAlarmsByELB(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let elb of regionELBs) {
                let alarmAnalysis: ResourceAnalysisResult = {};
                let elbAlarms =  alarmsMapByELB[this.getLoadBalancerDimensionId(elb.LoadBalancerArn)];
                alarmAnalysis.resource = {elb, alarms: elbAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'LoadBalancer',
                    value: elb.LoadBalancerName
                }
            
                if (this.isUnHealthyHostCountAlarmsPresent(elbAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Unhealthy hosts alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Failure;
                    alarmAnalysis.message = "Unhealthy hosts alarms are not enabled";
                    alarmAnalysis.action = 'Set Unhealthy hosts alarms';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        alb_unhealthy_hosts_alarms.regions = allRegionsAnalysis;
        return { alb_unhealthy_hosts_alarms };
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

    private isUnHealthyHostCountAlarmsPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName === 'UnHealthyHostCount';
        });
    }

    private getLoadBalancerDimensionId(loadBalancerArn: string) {
        return loadBalancerArn.split("/").slice(-3).join("/");
    }
}