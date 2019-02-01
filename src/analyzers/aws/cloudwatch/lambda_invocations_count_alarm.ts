import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class LambdaInvocationsCountAlarmAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport["aws.lambda"] || !fullReport["aws.lambda"].functions) {
            return undefined;
        }
        const allLambdaFunctions: any[] = fullReport["aws.lambda"].functions;

        const lambda_invocations_count_alarm: ICheckAnalysisResult = {
            type: CheckAnalysisType.OperationalExcellence,
        };
        lambda_invocations_count_alarm.what = "Are alarms are enabled for Lambda function based on invocation count?";
        lambda_invocations_count_alarm.why = `It is important to set invocation count alarm for all Lambda functions
        as if there is any bug in the code then Lambda functions can be
        triggered continuously in a loop and eventually you will get a huge AWS bill.`;
        lambda_invocations_count_alarm.recommendation = `Recommended to set invocation
        alarm for all the Lambda functions.`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allLambdaFunctions) {
            const regionLambdaFunctions = allLambdaFunctions[region];
            const regionAlarms = allAlarms[region];
            const alarmsMapByLambdaFunction = this.mapAlarmsByLambdaFunction(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (const lambdaFunction of regionLambdaFunctions) {
                const alarmAnalysis: IResourceAnalysisResult = {};
                const lambdaFunctionAlarms = alarmsMapByLambdaFunction[lambdaFunction.FunctionName];
                alarmAnalysis.resource = { lambdaFunction, alarms: lambdaFunctionAlarms };
                alarmAnalysis.resourceSummary = {
                    name: "LambdaFunction",
                    value: lambdaFunction.FunctionName,
                };

                if (this.isInvocationAlarmPresent(lambdaFunctionAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Invocations count alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Invocations count alarm is not enabled";
                    alarmAnalysis.action = "Set Invocations count alarm";
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        lambda_invocations_count_alarm.regions = allRegionsAnalysis;
        return { lambda_invocations_count_alarm };
    }

    private mapAlarmsByLambdaFunction(alarms: any[]): IDictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if (alarm.Namespace === "AWS/Lambda" && alarm.Dimensions) {
                const lambdaFunctionDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === "FunctionName";
                });
                if (lambdaFunctionDimension && lambdaFunctionDimension.Value) {
                    alarmsMap[lambdaFunctionDimension.Value] = alarmsMap[lambdaFunctionDimension.Value] || [];
                    alarmsMap[lambdaFunctionDimension.Value].push(alarm);

                }
            }
            return alarmsMap;
        }, {});
    }

    private isInvocationAlarmPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled &&
                alarm.AlarmActions &&
                alarm.AlarmActions.length &&
                alarm.MetricName === "Invocations";
        });
    }
}
