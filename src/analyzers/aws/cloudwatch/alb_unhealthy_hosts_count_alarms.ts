import {
    CheckAnalysisType, ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AlbUnHealthyHostAlarmsAnalyzer extends BaseAnalyzer {
    public  checks_what : string =  "Are alarms are enabled for ALB Unhealthy hosts?";
    public  checks_why : string =  `It is important to set alarms for Unhealthy hosts as otherwise the
    performance of the application will be degraded`;
    public checks_recommendation: string = `Recommended to set alarm for
    Unhealthy hosts to take appropriative action.`;
    public checks_name: string = "LoadBalancer";
    public analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport["aws.elb"] || !fullReport["aws.elb"].elbs) {
            return undefined;
        }
        const allELBs: any[] = fullReport["aws.elb"].elbs;

        const alb_unhealthy_hosts_alarms: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        alb_unhealthy_hosts_alarms.what = this.checks_what;
        alb_unhealthy_hosts_alarms.why =this.checks_why;
        alb_unhealthy_hosts_alarms.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allELBs) {
            const regionELBs = allELBs[region];
            const regionAlarms = allAlarms[region];
            const alarmsMapByELB = this.mapAlarmsByELB(regionAlarms);
            console.log(alarmsMapByELB);
            allRegionsAnalysis[region] = [];
            for (const elb of regionELBs) {
                const alarmAnalysis: IResourceAnalysisResult = {};
                console.log(elb.LoadBalancerArn);
                const elbAlarms = alarmsMapByELB[this.getLoadBalancerDimensionId(elb.LoadBalancerArn)];
                alarmAnalysis.resource = { elb, alarms: elbAlarms };
                alarmAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: elb.LoadBalancerName,
                };

                if (this.isUnHealthyHostCountAlarmsPresent(elbAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Unhealthy hosts alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Failure;
                    alarmAnalysis.message = "Unhealthy hosts alarms are not enabled";
                    alarmAnalysis.action = "Set Unhealthy hosts alarms";
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        alb_unhealthy_hosts_alarms.regions = allRegionsAnalysis;
        return { alb_unhealthy_hosts_alarms };
    }

    private mapAlarmsByELB(alarms: any[]): IDictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if (alarm.Namespace === "AWS/ApplicationELB" && alarm.Dimensions) {
                const elbDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === "LoadBalancer";
                });
                if (elbDimension && elbDimension.Value) {
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
                alarm.MetricName === "UnHealthyHostCount";
        });
    }

    private getLoadBalancerDimensionId(loadBalancerArn: string) {
        return loadBalancerArn.split("/").splice(-3).join("/");
    }
}
