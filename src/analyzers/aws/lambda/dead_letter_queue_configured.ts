import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class LambdaDeadLetterQueueAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined;
        }
        const dead_letter_queue_configured: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        dead_letter_queue_configured.what = "Is dead letter queue (DLQ) configured for Lambda functions?";
        dead_letter_queue_configured.why = `When we configure DLQ then Lambda function will pushes
        all the failure events into the queue for further investigation.`;
        dead_letter_queue_configured.recommendation = "Recommended to configure DLQ for all the Lambda functions";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctions) {
            const regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (const fn of regionFunctions) {
                const functionAnalysis: IResourceAnalysisResult = {};
                functionAnalysis.resource = fn;
                functionAnalysis.resourceSummary = {
                    name: "Function",
                    value: fn.FunctionName,
                };
                if (fn.DeadLetterConfig && fn.DeadLetterConfig.TargetArn) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = "Dead Letter Queue is configured";
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = "Dead Letter Queue is not configured";
                    functionAnalysis.action = "Configure DLQ";
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        dead_letter_queue_configured.regions = allRegionsAnalysis;
        return { dead_letter_queue_configured };
    }
}
