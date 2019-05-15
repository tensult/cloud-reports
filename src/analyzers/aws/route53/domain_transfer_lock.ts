import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";
import { Domain } from "domain";

export class DomainsTransferLockAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Is transfer lock enabled for the domains?";
    public  checks_why : string = `It is important to enable transfer lock
    for domains as it protects someone from claiming them`;
    public checks_recommendation : string = "Recommended to enable transfer lock for all your domains";
    public checks_name : string = "Domain";
    public analyze(params: any): any {
        const allDomains = params.domains;
        if (!allDomains || allDomains.length === 0) {
            return undefined;
        }
        const domains_transfer_lock: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        domains_transfer_lock.what = this.checks_what;
        domains_transfer_lock.why = this.checks_why;
        domains_transfer_lock.recommendation = this.checks_recommendation;
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
                name: this.checks_name, value: domain.DomainName,
            };
            allDomainAnalysis.push(domain_analysis);
        }
        domains_transfer_lock.regions = { global: allDomainAnalysis };
        return { domains_transfer_lock };
    }
}
