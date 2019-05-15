import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class LambdaDeadLetterQueueAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Is dead letter queue (DLQ) configured for Lambda functions?";
    public  checks_why : string = `When we configure DLQ then Lambda function will pushes
    all the failure events into the queue for further investigation.`;
    public checks_recommendation : string = "Recommended to configure DLQ for all the Lambda functions";
    public checks_name : string = "Function";
    public analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined; 
        }
        const dead_letter_queue_configured: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        dead_letter_queue_configured.what = this.checks_what;
        dead_letter_queue_configured.why = this.checks_why;
        dead_letter_queue_configured.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctions) {
            const regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (const fn of regionFunctions) {
                const functionAnalysis: IResourceAnalysisResult = {};
                functionAnalysis.resource = fn;
                functionAnalysis.resourceSummary = {
                    name: this.checks_name,
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
