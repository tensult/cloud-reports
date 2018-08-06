import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class LambdaFunctionVersionsCountAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allFunctionVersions = params.function_versions;
        if ( !allFunctionVersions) {
            return undefined;
        }
        const function_versions_count: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        function_versions_count.what = "Are there too many versions for any Lambda function?";
        function_versions_count.why = "We need to use versioning for Lambda functions but keeping too many versions will be confusing and also there is chance of exceed Lambda service limits so we need to keep deleting the old versions."
        function_versions_count.recommendation = "Recommended to keep maximum of 5 versions per Lambda function";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allFunctionVersions) {
            let regionFunctionVersions = allFunctionVersions[region];
            allRegionsAnalysis[region] = [];
            for (let functionName in regionFunctionVersions) {
                let functionAnalysis: ResourceAnalysisResult = {};
                functionAnalysis.resource = { functionName, versions: regionFunctionVersions[functionName]} ;
                functionAnalysis.resourceSummary = {
                    name: 'Function',
                    value: functionName
                }
                if (regionFunctionVersions[functionName].length === 1) {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = 'Versioning is not used';
                    functionAnalysis.action = 'Start using versioning';                    
                } else if (regionFunctionVersions[functionName].length <= 5) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = `Function has ${regionFunctionVersions[functionName].length} versions`;
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = `Function has ${regionFunctionVersions[functionName].length} versions`;
                    functionAnalysis.action = 'Keep deleting the old versions';                    
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        function_versions_count.regions = allRegionsAnalysis;
        return { function_versions_count };
    }
}