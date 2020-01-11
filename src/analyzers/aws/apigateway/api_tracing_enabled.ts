import {
    CheckAnalysisType,
    ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ApiXRayTracingAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allApis: any[] = params.apis;
        const allApiStages: any[] = params.api_stages;

        if (!allApis || !allApiStages) {
            return undefined;
        }
        const api_tracing_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        api_tracing_enabled.what = "Are XRay tracing enabled for APIs?";
        api_tracing_enabled.why = "XRay tracing for API helps to debug the issues faster";
        api_tracing_enabled.recommendation = `Recommended to enable XRay tracing for all Apis`;
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
                    if (this.isRequestTracingEnabled(apiStage)) {
                        apiStageAnalysis.severity = SeverityStatus.Good;
                        apiStageAnalysis.message = "XRay Tracing is enabled";
                    } else {
                        apiStageAnalysis.severity = SeverityStatus.Warning;
                        apiStageAnalysis.message = "XRay Tracing is not enabled";
                        apiStageAnalysis.action = `Enable XRay Tracing for API`;
                    }
                    allRegionsAnalysis[region].push(apiStageAnalysis);
                }
            }
        }
        api_tracing_enabled.regions = allRegionsAnalysis;
        return { api_tracing_enabled };
    }

    private isRequestTracingEnabled(stage: any) {
        return stage.tracingEnabled;
    }
}
