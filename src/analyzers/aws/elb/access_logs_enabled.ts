import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AccessLogsEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allElbsAttributes = params.elb_attributes;
        if (!allElbsAttributes) {
            return undefined;
        }
        const access_logs_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        access_logs_enabled.what = "Are access logs enabled for Load balancers?";
        access_logs_enabled.why = "Access logs helps us to understand request patterns also helps to detect threats";
        access_logs_enabled.recommendation = "Recommended to enable access logs for all public facing load balancers";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allElbsAttributes) {
            const regionElbsAttributes = allElbsAttributes[region];
            allRegionsAnalysis[region] = [];
            for (const elbName in regionElbsAttributes) {
                const elbAttributes = regionElbsAttributes[elbName];
                const elb_analysis: IResourceAnalysisResult = {};
                elb_analysis.resource = { name: elbName, attributes: elbAttributes };
                elb_analysis.resourceSummary = {
                    name: "LoadBalancer",
                    value: elbName,
                };
                if (this.isAccessLogsEnabled(elbAttributes)) {
                    elb_analysis.severity = SeverityStatus.Good;
                    elb_analysis.message = "Access logs are enabled";
                } else {
                    elb_analysis.severity = SeverityStatus.Failure;
                    elb_analysis.message = "Access logs are not enabled";
                    elb_analysis.action = "Enable access logs";
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        access_logs_enabled.regions = allRegionsAnalysis;
        return { access_logs_enabled };
    }

    private isAccessLogsEnabled(elbAttributes) {
        return elbAttributes && elbAttributes.some((attribute) => {
            return attribute.Key === "access_logs.s3.enabled" && attribute.Value === "true";
        });
    }
}
