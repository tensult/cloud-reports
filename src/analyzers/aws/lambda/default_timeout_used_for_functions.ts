import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class DefaultFunctionTimeoutAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allFunctions = params.functions;
        if ( !allFunctions) {
            return undefined;
        }
        const default_timeout_used_for_functions: CheckAnalysisResult = { type: [CheckAnalysisType.PerformanceEfficiency, CheckAnalysisType.Reliability] };
        default_timeout_used_for_functions.what = "Is default timeout is used for Lambda functions?";
        default_timeout_used_for_functions.why = "We need to set proper timeout for Lambda functions in order achieve desire performance."
        default_timeout_used_for_functions.recommendation = "Recommended to set proper timeout as per your requirements";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allFunctions) {
            let regionFunctions = allFunctions[region];
            allRegionsAnalysis[region] = [];
            for (let fn of regionFunctions) {
                let functionAnalysis: ResourceAnalysisResult = {};
                functionAnalysis.resource = fn ;
                functionAnalysis.resourceSummary = {
                    name: 'Function',
                    value: fn.FunctionName
                }
                if (fn.Timeout !== 3) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = 'Default timeout is not used';
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = 'Set a proper timeout as per your needs';
                    functionAnalysis.action = 'Analyze what function is doing and set a proper timeout';                    
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        default_timeout_used_for_functions.regions = allRegionsAnalysis;
        return { default_timeout_used_for_functions };
    }

    private getName(fn: any) {
        const nameTags = fn.Tags.filter((tag) => {
            return tag.Key == 'Name';
        });
        if (nameTags.length) {
            return nameTags[0].Value;
        } else {
            return 'Unassigned';
        }
    }
}