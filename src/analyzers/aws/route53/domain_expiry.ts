import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

const millsIn30Days = 30 * 24 * 60 * 60 * 1000;
export class DomainsExpiryAnalyzer extends BaseAnalyzer {

    public analyze(params: any): any {
        const allDomains = params.domains;
        if (!allDomains || allDomains.length === 0) {
            return undefined;
        }
        const domains_expiry: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        domains_expiry.what = "Are there any domain expiring soon?";
        domains_expiry.why = "When domains get expired, someone may claim them so it is import to keep an eye on them";
        domains_expiry.recommendation = `It is recommended to enable AutoRenewable to automatically renew the domain or
        we can periodically check the expiry and renew it manually`;
        const allDomainAnalysis: IResourceAnalysisResult[] = [];

        for (const domain of allDomains) {
            let domain_analysis: IResourceAnalysisResult = {};
            if (domain.AutoRenew) {
                domain_analysis.severity = SeverityStatus.Good;
                domain_analysis.message = "Domain is Auto renewable";
            } else {
                domain_analysis = this.analyzeNonAutoRenewabeDomain(domain);
            }
            domain_analysis.resource = domain;
            domain_analysis.resourceSummary = {
                name: "Domain",
                value: domain.DomainName,
            };
            allDomainAnalysis.push(domain_analysis);
        }
        domains_expiry.regions = { global: allDomainAnalysis };
        return { domains_expiry };
    }

    private analyzeNonAutoRenewabeDomain(domain: any) {
        const domain_analysis: IResourceAnalysisResult = {};
        const expirationTime = new Date(domain.Expiry);
        const dateAfter30Days = new Date(Date.now() + millsIn30Days);
        const dateAfter90Days = new Date(Date.now() + 3 * millsIn30Days);
        if (expirationTime < new Date()) {
            domain_analysis.severity = SeverityStatus.Failure;
            domain_analysis.message = "Domain is expired";
            domain_analysis.action = "Renew the domain or remove it if it is no longer needed";
        } else if (expirationTime < dateAfter30Days) {
            domain_analysis.severity = SeverityStatus.Warning;
            domain_analysis.message = "Domain is expiring within a month";
            domain_analysis.action = "Renew the domain immediately";
        } else if (expirationTime < dateAfter90Days) {
            domain_analysis.severity = SeverityStatus.Info;
            domain_analysis.message = "Domain is expiring within 3 months";
            domain_analysis.action = "Plan for its renewal";
        } else {
            domain_analysis.severity = SeverityStatus.Good;
            domain_analysis.message = "Domain is valid for more than 3 months";
        }
        domain_analysis.action = domain_analysis.action ? domain_analysis.action + ". " : "";
        domain_analysis.action = domain_analysis.action + "Consider enabling auto renewal for the domain";
        return domain_analysis;
    }
}
