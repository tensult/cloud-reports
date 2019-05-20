import {
    CheckAnalysisType,
    ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ApiMetricsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allApis: any[] = params.apis;
        const allApiStages: any[] = params.api_stages;

        if (!allApis || !allApiStages) {
            return undefined;
        }
        const api_metrics_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        api_metrics_enabled.what = "Is cloudwatch metrics is enabed for APIs?";
        api_metrics_enabled.why = `Enabling metrics will help APIs to monitor API stages caching, 
        latency and detected errors at a more granular level and set alarms accordingly.`;
        api_metrics_enabled.recommendation = `Recommended to enable metrics for all Apis.`;
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

                    apiStageAnalysis.resource = { apiName: api.name, stage: apiStage};
                    const _value = apiStage.methodSettings['*/*'] ?  `${api.name} | ${apiStage.methodSettings['*/*'].metricsEnabled}` : api.name;
                    apiStageAnalysis.resourceSummary = {
                        name: "ApiState",
                        value: _value,
                    };
                    if (this.isMetricsEnabled(apiStage)) {
                        apiStageAnalysis.severity = SeverityStatus.Good;
                        apiStageAnalysis.message = "Metrics is enabled.";
                    } else {
                        apiStageAnalysis.severity = SeverityStatus.Info;
                        apiStageAnalysis.message = "Metrics is not enabled.";
                        apiStageAnalysis.action = `Enable Metrics for API for
                        efficient data handling and error monitoring.`;
                    }
                    allRegionsAnalysis[region].push(apiStageAnalysis);
                }
            }
        }
        api_metrics_enabled.regions = allRegionsAnalysis;
        return { api_metrics_enabled };
    }

    private isMetricsEnabled(stage: any) {
        if (stage.methodSettings["*/*"]) {
            return stage.methodSettings["*/*"].dataTraceEnabled;
        }
    }
}
