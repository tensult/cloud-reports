import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class DeletionProtectionEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allElbsAttributes = params.elb_attributes;
        if (!allElbsAttributes) {
            return undefined;
        }
        const deletion_protection_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        deletion_protection_enabled.what = "Is deletion protection enabled for Load balancers?";
        deletion_protection_enabled.why = "Deletion protection should be enabled otherwise if you delete load balancer accidentally then it gets deleted permanently"
        deletion_protection_enabled.recommendation = "Recommended to enable deletion protection for all load balancers";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allElbsAttributes) {
            let regionElbsAttributes = allElbsAttributes[region];
            allRegionsAnalysis[region] = [];
            for (let elbName in regionElbsAttributes) {
                let elbAttributes = regionElbsAttributes[elbName];
                let elb_analysis: ResourceAnalysisResult = {};
                elb_analysis.resource = { name: elbName, attributes: elbAttributes };
                elb_analysis.resourceSummary = {
                    name: 'LoadBalancer',
                    value: elbName
                }
                if (this.isAccessLogsEnabled(elbAttributes)) {
                    elb_analysis.severity = SeverityStatus.Good;
                    elb_analysis.message = 'Deletion protection is enabled';
                } else {
                    elb_analysis.severity = SeverityStatus.Failure;
                    elb_analysis.message = 'Deletion protection is not enabled';
                    elb_analysis.action = 'Enable Deletion protection'
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        deletion_protection_enabled.regions = allRegionsAnalysis;
        return { deletion_protection_enabled };
    }

    private isAccessLogsEnabled(elbAttributes) {
        return elbAttributes && elbAttributes.some((attribute) => {
            return attribute.Key === 'deletion_protection.enabled' && attribute.Value === 'true';
        });
    }
}