import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class SecureListenerAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allElbs = params.elbs;
        const allElbListeners = params.elb_listeners;

        if (!allElbs && !allElbListeners) {
            return undefined;
        }
        const secure_listeners: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        secure_listeners.what = "Are there any Load balancers without secure(SSL/TSL) listeners?";
        secure_listeners.why = "Transmission of sensitive data to/from Load balancer should happen via secure listener";
        secure_listeners.recommendation = "Recommended to have secure listener and use them to transmit sensitive data";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allElbs) {
            const regionElbs = allElbs[region];
            allRegionsAnalysis[region] = [];
            for (const elb of regionElbs) {
                const elbListeners = allElbListeners[region][elb.LoadBalancerName];
                const elb_analysis: IResourceAnalysisResult = {};
                elb_analysis.resource = { name: elb.LoadBalancerName, listeners: elbListeners };
                elb_analysis.resourceSummary = {
                    name: "LoadBalancer",
                    value: elb.LoadBalancerName,
                };
                if (this.hasSecureListener(elbListeners)) {
                    elb_analysis.severity = SeverityStatus.Good;
                    elb_analysis.message = "ELB has secure listener";
                } else {
                    elb_analysis.severity = SeverityStatus.Warning;
                    elb_analysis.message = "ELB does not have secure listener";
                    elb_analysis.action = "Create HTTPS secure listener";
                }
                allRegionsAnalysis[region].push(elb_analysis);
            }
        }
        secure_listeners.regions = allRegionsAnalysis;
        return { secure_listeners };
    }

    private hasSecureListener(listeners: any[]) {
        return listeners && listeners.some((listener) => {
            return listener.Protocol === "HTTPS";
        });
    }
}
