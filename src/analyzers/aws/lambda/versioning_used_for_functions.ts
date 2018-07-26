import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class LambdaFunctionVersioningUsageAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allFunctionVersions = params.function_versions;
        if ( !allFunctionVersions) {
            return undefined;
        }
        const versioning_used_for_functions: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        versioning_used_for_functions.what = "Are you using versioning for Lambda functions?";
        versioning_used_for_functions.why = "We need to use versioning for Lambda functions; when every we update the function, it is important that we create a new version and make changes there so that if required we can roll back to previous version."
        versioning_used_for_functions.recommendation = "Recommended to use versioning while deploying the Lambda functions";
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
                if (regionFunctionVersions[functionName].length > 1) {
                    functionAnalysis.severity = SeverityStatus.Good;
                    functionAnalysis.message = 'Versioning is used';
                } else {
                    functionAnalysis.severity = SeverityStatus.Warning;
                    functionAnalysis.message = 'Versioning is not used';
                    functionAnalysis.action = 'Start using versioning';                    
                }
                allRegionsAnalysis[region].push(functionAnalysis);
            }
        }
        versioning_used_for_functions.regions = allRegionsAnalysis;
        return { versioning_used_for_functions };
    }
}