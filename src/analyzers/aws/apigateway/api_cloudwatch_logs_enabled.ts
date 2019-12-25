import {
    CheckAnalysisType, ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ApiLogsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allApis: any[] = params.apis;
        const allApiStages: any[] = params.api_stages;
    
        if (!allApis || !allApiStages) {
            return undefined;
        }
        const api_logs_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        api_logs_enabled.what = "Are CloudWatch logs enabled for Apis?";
        api_logs_enabled.why = "It is important to set logs for Apis for debugging API issues";
        api_logs_enabled.recommendation = "Recommended to set logs for all Apis";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allApis) {
            const regionApis = allApis[region];
            allRegionsAnalysis[region] = [];
            for (const api of regionApis) {
                if (!allApiStages[region][api.id] || !allApiStages[region][api.id].length) {
                    continue;
                }
                for (const apiStage of allApiStages[region][api.id]) {
                    const apiStageAnalysis: IResourceAnalysisResult = {};

                    apiStageAnalysis.resource = { apiName: api.name, stage: apiStage };
                    apiStageAnalysis.resourceSummary = {
                        name: "ApiState",
                        value: `${api.name} | ${apiStage.stageName}`,
                    };
                    const stageLogLevel = this.getLogLevel(apiStage);
                    if (stageLogLevel && stageLogLevel !== "OFF") {
                        apiStageAnalysis.severity = SeverityStatus.Good;
                        apiStageAnalysis.message = `Logs are enabled with logLevel: ${stageLogLevel}`;
                    } else {
                        apiStageAnalysis.severity = SeverityStatus.Warning;
                        apiStageAnalysis.message = "Logs are not enabled";
                        apiStageAnalysis.action = "Set logs for API Stage";
                    }
                    allRegionsAnalysis[region].push(apiStageAnalysis);
                }
            }
        }

        api_logs_enabled.regions = allRegionsAnalysis;


   
 
        return { api_logs_enabled };
    }

    private getLogLevel(stage: any) {
        if (stage.methodSettings["*/*"]) {
            return stage.methodSettings["*/*"].loggingLevel;
        }
    }
}
