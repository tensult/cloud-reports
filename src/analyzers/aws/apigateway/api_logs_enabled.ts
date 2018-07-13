import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class ApiLogsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allApis: any[] = params.apis;
        const allApiStages: any[] = params.api_stages;

        if (!allApis || !allApiStages) {
            return undefined;
        }
        const api_logs_enabled: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        api_logs_enabled.what = "Are logs enabled for Apis?";
        api_logs_enabled.why = "It is important to set logs for Apis for debugging API issues"
        api_logs_enabled.recommendation = "Recommended to set logs for all Apis";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allApis) {
            let regionApis = allApis[region];
            allRegionsAnalysis[region] = [];
            for (let api of regionApis) {
                let apiAnalysis: ResourceAnalysisResult = {};
                let apiStages = allApiStages[region][api.id];
                if(!apiStages) {
                    continue;
                }
                apiAnalysis.resource = { api, stages: apiStages };
                apiAnalysis.resourceSummary = {
                    name: 'Api',
                    value: api.name
                }
                if (this.isApiLogsEnabled(apiStages)) {
                    apiAnalysis.severity = SeverityStatus.Good;
                    apiAnalysis.message = 'Logs are enabled';
                } else {
                    apiAnalysis.severity = SeverityStatus.Warning;
                    apiAnalysis.message = 'Logs are not enabled';
                    apiAnalysis.action = 'Set logs for API';
                }
                allRegionsAnalysis[region].push(apiAnalysis);
            }
        }
        api_logs_enabled.regions = allRegionsAnalysis;
        return { api_logs_enabled };
    }

    private isApiLogsEnabled(stages: any[]) {
        return stages.some((stage) => {
            return stage.methodSettings["*/*"] && stage.methodSettings["*/*"].loggingLevel !== "OFF";
        });
    }
}