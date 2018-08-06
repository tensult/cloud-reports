import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class LambdaFunctionVersioningUsageAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allFunctionVersions = params.function_versions;
        if ( !allFunctionVersions) {
            return undefined;
        }
        const function_versions_used: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        function_versions_used.what = "Are you using versioning for Lambda functions?";
        function_versions_used.why = "We need to use versioning for Lambda functions; when every we update the function, it is important that we create a new version and make changes there so that if required we can roll back to previous version."
        function_versions_used.recommendation = "Recommended to use versioning while deploying the Lambda functions";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allFunctionVersions) {
            let regionFunctionVersions = allFunctionVersions[region];
            allRegionsAnalysis[region] = [];
            for (let functionName in regionFunctionVersions) {
                let functionAnalysis: ResourceAnalysisResult = {};
                let functionVersions = this.getNonDefaultVersions(regionFunctionVersions[functionName]);
                functionAnalysis.resource = { functionName, versions: functionVersions} ;
                functionAnalysis.resourceSummary = {
                    name: 'Function',
                    value: functionName
                }
                if (functionVersions.length) {
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
        function_versions_used.regions = allRegionsAnalysis;
        return { function_versions_used };
    }

    private getNonDefaultVersions(functions: any[]) {
        if (!functions) {
            return [];
        }
        return functions.filter((fn) => {
            return fn.Version !== '$LATEST';
        });
    }
}