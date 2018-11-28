import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DefaultFunctionTimeoutAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined;
        }
        const default_timeout_used_for_functions:
            ICheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        default_timeout_used_for_functions.what = "Is default timeout is used for Lambda functions?";
        default_timeout_used_for_functions.why = `We need to set proper timeout for Lambda
        functions in order achieve desire performance.`;
        default_timeout_used_for_functions.recommendation = `Recommended to set proper
        timeout as per your requirements`;
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
                if (fn.Timeout !== 3) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = "Default timeout is not used";
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = "Set a proper timeout as per your needs";
                    functionAnalysis.action = "Analyze what function is doing and set a proper timeout";
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        default_timeout_used_for_functions.regions = allRegionsAnalysis;
        return { default_timeout_used_for_functions };
    }
}
