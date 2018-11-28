import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DomainsTransferLockAnalyzer extends BaseAnalyzer {

    public analyze(params: any): any {
        const allDomains = params.domains;
        if (!allDomains || allDomains.length === 0) {
            return undefined;
        }
        const domains_transfer_lock: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        domains_transfer_lock.what = "Is transfer lock enabled for the domains?";
        domains_transfer_lock.why = `It is important to enable transfer lock
        for domains as it protects someone from claiming them`;
        domains_transfer_lock.recommendation = "Recommended to enable transfer lock for all your domains";
        const allDomainAnalysis: IResourceAnalysisResult[] = [];

        for (const domain of allDomains) {
            const domain_analysis: IResourceAnalysisResult = {};
            if (domain.TransferLock) {
                domain_analysis.severity = SeverityStatus.Good;
                domain_analysis.message = "Domain has transfer lock enabled";
            } else {
                domain_analysis.severity = SeverityStatus.Warning;
                domain_analysis.message = "Domain doesn't have transfer lock enabled";
                domain_analysis.action = "Enable transfer lock for the domain";
            }
            domain_analysis.resource = domain;
            domain_analysis.resourceSummary = {
                name: "Domain", value: domain.DomainName,
            };
            allDomainAnalysis.push(domain_analysis);
        }
        domains_transfer_lock.regions = { global: allDomainAnalysis };
        return { domains_transfer_lock };
    }
}
