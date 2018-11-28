import {
    CheckAnalysisType, ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ApiGateway5xxAlarmsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport["aws.apigateway"] || !fullReport["aws.apigateway"].apis) {
            return undefined;
        }
        const allApis: any[] = fullReport["aws.apigateway"].apis;

        const api_5xx_errors_alarms: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        api_5xx_errors_alarms.what = "Are alarms are enabled for Api 5XX errors?";
        api_5xx_errors_alarms.why = `It is important to set alarms for 5XX Errors as otherwise
        you won't be aware when the application is failing`;
        api_5xx_errors_alarms.recommendation = "Recommended to set alarm for 5XX Errors to take appropriative action.";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allApis) {
            const regionApis = allApis[region];
            const regionAlarms = allAlarms[region];
            const alarmsMapByApi = this.mapAlarmsByApi(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (const api of regionApis) {
                const alarmAnalysis: IResourceAnalysisResult = {};
                const apiAlarms = alarmsMapByApi[api.name];
                alarmAnalysis.resource = { api, alarms: apiAlarms };
                alarmAnalysis.resourceSummary = {
                    name: "ApiName",
                    value: api.name,
                };

                if (this.is5xxAlarmsPresent(apiAlarms)) {
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
        api_5xx_errors_alarms.regions = allRegionsAnalysis;
        return { api_5xx_errors_alarms };
    }

    private mapAlarmsByApi(alarms: any[]): IDictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if (alarm.Namespace === "AWS/ApiGateway" && alarm.Dimensions) {
                const apiDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === "ApiName";
                });
                if (apiDimension && apiDimension.Value) {
                    alarmsMap[apiDimension.Value] = alarmsMap[apiDimension.Value] || [];
                    alarmsMap[apiDimension.Value].push(alarm);

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
