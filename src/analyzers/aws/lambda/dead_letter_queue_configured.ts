import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class LambdaDeadLetterQueueAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if ( !allFunctions) {
            return undefined;
        }
        const dead_letter_queue_configured: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        dead_letter_queue_configured.what = "Is dead letter queue (DLQ) configured for Lambda functions?";
        dead_letter_queue_configured.why = "When we configure DLQ then Lambda function will pushes all the failure events into the queue for further investigation."
        dead_letter_queue_configured.recommendation = "Recommended to configure DLQ for all the Lambda functions";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allFunctions) {
            let regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (let fn of regionFunctions) {
                let functionAnalysis: ResourceAnalysisResult = {};
                functionAnalysis.resource = fn;
                functionAnalysis.resourceSummary = {
                    name: 'Function',
                    value: fn.FunctionName
                }
                if (fn.DeadLetterConfig && fn.DeadLetterConfig.TargetArn) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = 'Dead Letter Queue is configured';
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = 'Dead Letter Queue is not configured';
                    functionAnalysis.action = 'Configure DLQ';                    
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        dead_letter_queue_configured.regions = allRegionsAnalysis;
        return { dead_letter_queue_configured };
    }
}