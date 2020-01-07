import {
    CheckAnalysisType,
    ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ApiRequestLogsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allApis: any[] = params.apis;
        const allApiStages: any[] = params.api_stages;

        if (!allApis || !allApiStages) {
            return undefined;
        }
        const api_logs_enabled : ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        api_logs_enabled.what = "Are APIs logging requests and response?";
        api_logs_enabled.why = "Logging request and response helps to debug APIs better";
        api_logs_enabled.recommendation = `Recommended to enable logs for all Apis which doesn't handle
        sensitive data as we can't log sensitive information in logs`;
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
                    if (this.isRequestLoggingEnabled(apiStage)) {
                        apiStageAnalysis.severity = SeverityStatus.Good;
                        apiStageAnalysis.message = "Request Logging is enabled";
                    } else {
                        apiStageAnalysis.severity = SeverityStatus.Info;
                        apiStageAnalysis.message = "Request Logging is not enabled";
                        apiStageAnalysis.action = `Enable Request Logging for API if
                        it doesn't deal with any sensitive data`;
                    }
                    allRegionsAnalysis[region].push(apiStageAnalysis);
                }
            }
        }
        api_logs_enabled.regions = allRegionsAnalysis;
        return { api_logs_enabled };
    }

    private isRequestLoggingEnabled(stage: any) {
        if (stage.methodSettings["*/*"]) {
            return stage.methodSettings["*/*"].dataTraceEnabled;
        }
    }
}
