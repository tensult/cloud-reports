import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class TracingAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if (!allFunctions) {
            return undefined;
        }
        const tracing_mode_functions:
            ICheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        tracing_mode_functions.what = "Is tracing mode function is enabled?";
        tracing_mode_functions.why = `After tracing mode is enabled, you can save time and effort debugging and
         operating your functions as the X-Ray service support allows you to rapidly diagnose errors, 
         identify bottlenecks, slowdowns and timeouts by breaking down the latency for your Lambda functions.`;
        tracing_mode_functions.recommendation = `Recommended to enable tracing so that AWS X-Ray can be enabled.`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctions) {
            const regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (const fn of regionFunctions) {
                const functionAnalysis: IResourceAnalysisResult = {};
                functionAnalysis.resource = fn;
                functionAnalysis.resourceSummary = {
                    name: "Function",
                    value: fn.TracingConfig.Mode,                  
                };
                const P = fn.TracingConfig;
                if (fn.TracingConfig.Mode == "PassThrough") {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = "Tracing for AWS Lambda is not enabled.";
                    functionAnalysis.action = "The AWS X-Ray integration for AWS Lambda should be enabled.";
                } else {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = "Tracing is enabled.";
                    
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        tracing_mode_functions.regions = allRegionsAnalysis;
        return { tracing_mode_functions };
    }
}
