import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class LambdaInvocationsCountAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        if (!allAlarms || !fullReport['aws.lambda'] || !fullReport['aws.lambda'].functions) {
            return undefined;
        }
        const allLambdaFunctions: any[] = fullReport['aws.lambda'].functions;

        const lambda_invocations_count_alarm: CheckAnalysisResult = { type: [CheckAnalysisType.OperationalExcellence] };
        lambda_invocations_count_alarm.what = "Are alarms are enabled for Lambda function based on invocation count?";
        lambda_invocations_count_alarm.why = "It is important to set invocation count alarm for all Lambda functions as if there is any bug in the code then Lambda functions can be triggered continuously in a loop and eventually you will get a huge AWS bill."
        lambda_invocations_count_alarm.recommendation = "Recommended to set invocation alarm for all the Lambda functions.";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allLambdaFunctions) {
            let regionLambdaFunctions = allLambdaFunctions[region];
            let regionAlarms = allAlarms[region];
            let alarmsMapByLambdaFunction = this.mapAlarmsByLambdaFunction(regionAlarms);
            allRegionsAnalysis[region] = [];
            for (let lambdaFunction of regionLambdaFunctions) {
                let alarmAnalysis: ResourceAnalysisResult = {};
                let lambdaFunctionAlarms =  alarmsMapByLambdaFunction[lambdaFunction.FunctionName];
                alarmAnalysis.resource = {lambdaFunction, alarms: lambdaFunctionAlarms};
                alarmAnalysis.resourceSummary = {
                    name: 'LambdaFunction',
                    value: lambdaFunction.FunctionName
                }
                
                if (this.isInvocationAlarmPresent(lambdaFunctionAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Invocations count alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Invocations count alarm is not enabled";
                    alarmAnalysis.action = 'Set Invocations count alarm';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        lambda_invocations_count_alarm.regions = allRegionsAnalysis;
        return { lambda_invocations_count_alarm };
    }

    private mapAlarmsByLambdaFunction(alarms: any[]): Dictionary<any[]> {
        return alarms.reduce((alarmsMap, alarm) => {
            if(alarm.Namespace === 'AWS/Lambda' && alarm.Dimensions) {
                const lambdaFunctionDimension = alarm.Dimensions.find((dimension) => {
                    return dimension.Name === 'FunctionName';
                });
                if(lambdaFunctionDimension && lambdaFunctionDimension.Value) {
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
            alarm.MetricName === 'Invocations';
        });
    }
}