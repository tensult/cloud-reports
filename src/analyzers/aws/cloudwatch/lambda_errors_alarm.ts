import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class LambdaErrorsAlarmAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAlarms: any[] = params.alarms;
        const allLambdaFunctions: any[] = fullReport['aws.lambda'].functions;
        if (!allAlarms || !allLambdaFunctions) {
            return undefined;
        }
        const lambda_errors_alarm: CheckAnalysisResult = { type: [CheckAnalysisType.OperationalExcellence] };
        lambda_errors_alarm.what = "Are alarms are enabled for Lambda function Errors?";
        lambda_errors_alarm.why = "It is important to set Errors alarm for all Lambda functions so that when Lambda functions are failing we will be notified."
        lambda_errors_alarm.recommendation = "Recommended to set errors alarm for all Lambda functions.";
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
                
                if (this.isErrorsAlarmPresent(lambdaFunctionAlarms)) {
                    alarmAnalysis.severity = SeverityStatus.Good;
                    alarmAnalysis.message = "Errors alarm is enabled";
                } else {
                    alarmAnalysis.severity = SeverityStatus.Warning;
                    alarmAnalysis.message = "Errors alarm is not enabled";
                    alarmAnalysis.action = 'Set Errors alarm';               
                }
                allRegionsAnalysis[region].push(alarmAnalysis);
            }
        }
        lambda_errors_alarm.regions = allRegionsAnalysis;
        return { lambda_errors_alarm };
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

    private isErrorsAlarmPresent(alarms) {
        return alarms && alarms.some((alarm) => {
            return alarm.ActionsEnabled && 
            alarm.AlarmActions &&
            alarm.AlarmActions.length &&
            alarm.MetricName === 'Errors';
        });
    }
}