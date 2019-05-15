import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { CloudFrontUtil } from "../../../utils/aws/cloudfront";
import { BaseAnalyzer } from "../../base";

export class CloudFront5xxAlarmsAnalyzer extends BaseAnalyzer {
    public checks_what : string = "Are alarms are enabled for Distribution 5XX errors?";
    public checks_why : string =  `It is important to set alarms for 5XX Errors as otherwise
    you won't be aware when the application is failing`;
    public analyze(params: any, fullReport?: any): any {
        const allDistributions: any[] = params.distributions;
        if (!allDistributions || !fullReport["aws.cloudwatch"] || !fullReport["aws.cloudwatch"].alarms) {
            return undefined;
        }
        const allAlarms: any[] = fullReport["aws.cloudwatch"].alarms;

        const distribution_5xx_errors_alarms: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        distribution_5xx_errors_alarms.what = this.checks_what;
        distribution_5xx_errors_alarms.why = this.checks_why;
        distribution_5xx_errors_alarms.recommendation = `Recommended to set alarm
        for 5XX Errors to take appropriative action.`;
        const allDistributionsAnalysis: IResourceAnalysisResult[] = [];
        for (const distribution of allDistributions) {
            const alarms = allAlarms["us-east-1"];
            const alarmsMapByDistribution = this.mapAlarmsByDistribution(alarms);
            const alarmAnalysis: IResourceAnalysisResult = {};
            const distributionAlarms = alarmsMapByDistribution[distribution.Id];
            alarmAnalysis.resource = { distribution, alarms: distributionAlarms };
            const distributionAlias = CloudFrontUtil.getAliasName(distribution);
            alarmAnalysis.resourceSummary = {
                name: "CloudFrontDistribution",
                value: distributionAlias ? `${distributionAlias} | ${distribution.Id}` : distribution.Id,
            };

            if (this.is5xxAlarmsPresent(distributionAlarms)) {
                alarmAnalysis.severity = SeverityStatus.Good;
                alarmAnalysis.message = "5XX errors alarms are enabled";
            } else {
                alarmAnalysis.severity = SeverityStatus.Failure;
                alarmAnalysis.message = "5XX errors alarms are not enabled";
                alarmAnalysis.action = "Set 5XX errors alarms";
            }
            allDistributionsAnalysis.push(alarmAnalysis);
        }

        distribution_5xx_errors_alarms.regions = { global: allDistributionsAnalysis };
        return { distribution_5xx_errors_alarms };
    }

    private mapAlarmsByDistribution(alarms: any[]): IDictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if (alarm.Namespace === "AWS/CloudFront" && alarm.Dimensions) {
                const distributionDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === "DistributionId";
                });
                if (distributionDimension && distributionDimension.Value) {
                    alarmsMap[distributionDimension.Value] = alarmsMap[distributionDimension.Value] || [];
                    alarmsMap[distributionDimension.Value].push(alarm);

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
}
