import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DeletionProtectionEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allElbsAttributes = params.elb_attributes;
        if (!allElbsAttributes) {
            return undefined;
        }
        const deletion_protection_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        deletion_protection_enabled.what = "Is deletion protection enabled for Load balancers?";
        deletion_protection_enabled.why = `Deletion protection should be enabled otherwise if
        you delete load balancer accidentally then it gets deleted permanently`;
        deletion_protection_enabled.recommendation = "Recommended to enable deletion protection for all load balancers";
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
                    elb_analysis.message = "Deletion protection is enabled";
                } else {
                    elb_analysis.severity = SeverityStatus.Failure;
                    elb_analysis.message = "Deletion protection is not enabled";
                    elb_analysis.action = "Enable Deletion protection";
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        deletion_protection_enabled.regions = allRegionsAnalysis;
        return { deletion_protection_enabled };
    }

    private isAccessLogsEnabled(elbAttributes) {
        return elbAttributes && elbAttributes.some((attribute) => {
            return attribute.Key === "deletion_protection.enabled" && attribute.Value === "true";
        });
    }
}
