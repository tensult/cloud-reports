import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class SecureListenerAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allElbs = params.elbs;
        if (!allElbs) {
            return undefined;
        }
        const secure_listeners_v1: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        secure_listeners_v1.what = "Are there any Load balancers without secure(SSL/TSL) listeners?";
        secure_listeners_v1.why = "Transmission of sensitive data to/from Load balancer should happen via secure listener"
        secure_listeners_v1.recommendation = "Recommended to have secure listener and use them to transmit sensitive data";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allElbs) {
            let regionElbs = allElbs[region];
            allRegionsAnalysis[region] = [];
            for (let elbName in regionElbs) {
                let elb = regionElbs[elbName];
                let elb_analysis: ResourceAnalysisResult = {};
                elb_analysis.resource = { name: elb.LoadBalancerName, listeners: elb.ListenerDescriptions};
                elb_analysis.resourceSummary = { 
                    name: 'LoadBalancer',
                    value: elb.LoadBalancerName
                }
                if (this.hasSecureListener(elb.ListenerDescriptions)) {
                    elb_analysis.severity = SeverityStatus.Good;
                    elb_analysis.message = 'ELB has secure listener';
                } else {
                    elb_analysis.severity = SeverityStatus.Warning;
                    elb_analysis.message = 'ELB does not have secure listener';
                    elb_analysis.action = 'Create HTTPS secure listener'
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        secure_listeners_v1.regions = allRegionsAnalysis;
        return { secure_listeners_v1 };
    }

    private hasSecureListener(listeners: any[]) {
        const secureListeners = listeners.filter((listener) => {
            return listener.Listener.Protocol === 'HTTPS';
        });
        return secureListeners.length > 0;
    }
}