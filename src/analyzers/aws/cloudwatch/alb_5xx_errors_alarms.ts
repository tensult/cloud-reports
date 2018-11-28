import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class Alb5xxAlarmsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport["aws.elb"] || !fullReport["aws.elb"].elbs) {
            return undefined;
        }
        const allELBs: any[] = fullReport["aws.elb"].elbs;

        const alb_5xx_errors_alarms: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        alb_5xx_errors_alarms.what = "Are alarms are enabled for ALB 5XX errors?";
        alb_5xx_errors_alarms.why = `It is important to set alarms for 5XX Errors
        as otherwise you won't be aware when the application is failing`;
        alb_5xx_errors_alarms.recommendation = "Recommended to set alarm for 5XX Errors to take appropriative action.";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allELBs) {
            const regionELBs = allELBs[region];
            const regionAlarms = allAlarms[region];
            const alarmsMapByELB = this.mapAlarmsByELB(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (const elb of regionELBs) {
                const alarmAnalysis: IResourceAnalysisResult = {};
                const elbAlarms = alarmsMapByELB[this.getLoadBalancerDimensionId(elb.LoadBalancerArn)];
                alarmAnalysis.resource = { elb, alarms: elbAlarms };
                alarmAnalysis.resourceSummary = {
                    name: "LoadBalancer",
                    value: elb.LoadBalancerName,
                };

                if (this.is5xxAlarmsPresent(elbAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "5XX errors alarms are enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Failure;
                    alarmAnalysis.message = "5XX errors alarms are not enabled";
                    alarmAnalysis.action = "Set 5XX errors alarms";
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        alb_5xx_errors_alarms.regions = allRegionsAnalysis;
        return { alb_5xx_errors_alarms };
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
