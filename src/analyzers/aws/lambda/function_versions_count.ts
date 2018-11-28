import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class LambdaFunctionVersionsCountAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allFunctionVersions = params.function_versions;
        if (!allFunctionVersions) {
            return undefined;
        }
        const function_versions_count: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        function_versions_count.what = "Are there too many versions for any Lambda function?";
        function_versions_count.why = `We need to use versioning for Lambda functions but keeping too many versions
        will be confusing and also there is chance of exceed Lambda
        service limits so we need to keep deleting the old versions.`;
        function_versions_count.recommendation = "Recommended to keep maximum of 5 versions per Lambda function";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctionVersions) {
            const regionFunctionVersions = allFunctionVersions[region];
            allRegionsAnalysis[region] = [];
            for (const functionName in regionFunctionVersions) {
                const functionAnalysis: IResourceAnalysisResult = {};
                functionAnalysis.resource = { functionName, versions: regionFunctionVersions[functionName] };
                functionAnalysis.resourceSummary = {
                    name: "Function",
                    value: functionName,
                };
                if (regionFunctionVersions[functionName].length === 1) {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = "Versioning is not used";
                    functionAnalysis.action = "Start using versioning";
                } else if (regionFunctionVersions[functionName].length <= 5) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = `Function has ${regionFunctionVersions[functionName].length} versions`;
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = `Function has ${regionFunctionVersions[functionName].length} versions`;
                    functionAnalysis.action = "Keep deleting the old versions";
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        function_versions_count.regions = allRegionsAnalysis;
        return { function_versions_count };
    }
}
