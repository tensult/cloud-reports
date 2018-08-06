import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class AccessLogsEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allElbsAttributes = params.elb_attributes;
        if (!allElbsAttributes) {
            return undefined;
        }
        const access_logs_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        access_logs_enabled.what = "Are access logs enabled for Load balancers?";
        access_logs_enabled.why = "Access logs helps us to understand request patterns also helps to detect threats"
        access_logs_enabled.recommendation = "Recommended to enable access logs for all public facing load balancers";
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
                    elb_analysis.message = 'Access logs are enabled';
                } else {
                    elb_analysis.severity = SeverityStatus.Failure;
                    elb_analysis.message = 'Access logs are not enabled';
                    elb_analysis.action = 'Enable access logs'
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        access_logs_enabled.regions = allRegionsAnalysis;
        return { access_logs_enabled };
    }

    private isAccessLogsEnabled(elbAttributes) {
        return elbAttributes && elbAttributes.some((attribute) => {
            return attribute.Key === 'access_logs.s3.enabled' && attribute.Value === 'true';
        });
    }
}