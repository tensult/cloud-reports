import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class LambdaFunctionAliasesUsageAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allFunctionAliases = params.function_aliases;
        if (!allFunctionAliases) {
            return undefined;
        }
        const function_aliases_used: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        function_aliases_used.what = "Are you using aliasing for Lambda functions?";
        function_aliases_used.why = `We need to use aliasing for Lambda functions;
        when every we make major updates to the function,
        it is important that we use alias with traffic shaping between
        multiple aliases so that we can perform A/B testing and smoothly migrate applications.`;
        function_aliases_used.recommendation = `Recommended to use aliasing while
        deploying major changes to the Lambda functions`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctionAliases) {
            const regionFunctionAliases = allFunctionAliases[region];
            allRegionsAnalysis[region] = [];
            for (const functionName in regionFunctionAliases) {
                const functionAnalysis: IResourceAnalysisResult = {};
                const functionAliases = this.getNonDefaultAlias(regionFunctionAliases[functionName]);
                functionAnalysis.resource = { functionName, aliases: functionAliases };
                functionAnalysis.resourceSummary = {
                    name: "Function",
                    value: functionName,
                };
                if (functionAliases.length) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = "Aliasing is used";
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = "Aliasing is not used";
                    functionAnalysis.action = "Start using Aliasing";
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        function_aliases_used.regions = allRegionsAnalysis;
        return { function_aliases_used };
    }

    private getNonDefaultAlias(aliases: any[]) {
        if (!aliases) {
            return [];
        }
        return aliases.filter((alias) => {
            return alias.Name !== "current";
        });
    }
}
