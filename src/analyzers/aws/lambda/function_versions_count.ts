import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";
import { LambdaDeadLetterQueueAnalyzer } from "./dead_letter_queue_configured";

export class LambdaFunctionVersionsCountAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are there too many versions for any Lambda function?";
    public  checks_why : string = `We need to use versioning for Lambda functions but keeping too many versions
    will be confusing and also there is chance of exceed Lambda
    service limits so we need to keep deleting the old versions.`;
    public checks_recommendation : string = "Recommended to keep maximum of 5 versions per Lambda function";
    public checks_name : string = "Function";
    public analyze(params: any, fullReport?: any): any {
        const allFunctionVersions = params.function_versions;
        if (!allFunctionVersions) {
            return undefined;
        }
        const function_versions_count: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        function_versions_count.what = this.checks_what;
        function_versions_count.why = this.checks_why;
        function_versions_count.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allFunctionVersions) {
            const regionFunctionVersions = allFunctionVersions[region];
            allRegionsAnalysis[region] = [];
            for (const functionName in regionFunctionVersions) {
                const functionAnalysis: IResourceAnalysisResult = {};
                functionAnalysis.resource = { functionName, versions: regionFunctionVersions[functionName] };
                functionAnalysis.resourceSummary = {
                    name: this.checks_name,
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
