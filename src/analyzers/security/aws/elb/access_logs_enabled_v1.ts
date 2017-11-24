import { BaseAnalyzer } from '../../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus } from '../../../../types';

export class AccessLogsEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allElbsAttributes = params.elb_attributes;
        if (!allElbsAttributes) {
            return undefined;
        }
        const access_logs_enabled_v1: CheckAnalysisResult = {};
        access_logs_enabled_v1.what = "Are access logs enabled for Load balancers?";
        access_logs_enabled_v1.why = "Access logs helps us to understand request patterns also helps to detect threats"
        access_logs_enabled_v1.recommendation = "Recommended to enable access logs for all public facing load balancers";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allElbsAttributes) {
            let regionElbsAttributes = allElbsAttributes[region];
            allRegionsAnalysis[region] = [];
            for (let elbName in regionElbsAttributes) {
                let elbAttributes = regionElbsAttributes[elbName];
                let elb_analysis: ResourceAnalysisResult = {};
                elb_analysis.resource = { name: elbName, attributes: elbAttributes};
                elb_analysis.resourceSummary = { 
                    name: 'LoadBalancer',
                    value: elbName
                }
                if (elbAttributes.AccessLog.Enabled) {
                    elb_analysis.severity = SeverityStatus.Good;
                    elb_analysis.message = 'Already enabled';
                } else {
                    elb_analysis.severity = SeverityStatus.Failure;
                    elb_analysis.message = 'Not enabled';
                    elb_analysis.action = 'Enable access logs'
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        access_logs_enabled_v1.regions = allRegionsAnalysis;
        return { access_logs_enabled_v1 };
    }
}