import { BaseAnalyzer } from '../../base'
import { ResourceAnalysisResult, SeverityStatus, CheckAnalysisResult, CheckAnalysisType } from '../../../types';

export class DomainsTransferLockAnalyzer extends BaseAnalyzer {

    analyze(params: any): any {
        const allDomains = params.domains;
        if (!allDomains || allDomains.length === 0) {
            return undefined;
        }
        const domains_transfer_lock: CheckAnalysisResult = {type: CheckAnalysisType.Reliability};
        domains_transfer_lock.what = "Is transfer lock enabled for the domains?";
        domains_transfer_lock.why = "It is important to enable transfer lock for domains as it protects from someone to claiming them"
        domains_transfer_lock.recommendation = "Recommended to enable transfer lock for all your domains";
        const allDomainAnalysis: ResourceAnalysisResult[] = [];

        for (let domain of allDomains) {
            let domain_analysis: ResourceAnalysisResult = {};
            if (domain.TransferLock) {
                domain_analysis.severity = SeverityStatus.Good;
                domain_analysis.message = "Domain has transfer lock enabled";
            } else {
                domain_analysis.severity = SeverityStatus.Warning;     
                domain_analysis.message = "Domain doesn't have transfer lock enabled";
                domain_analysis.action = "Enable transfer lock for the domain"
            }
            domain_analysis.resource = domain;
            domain_analysis.resourceSummary = {
                name: 'Domain', value: domain.DomainName
            }
            allDomainAnalysis.push(domain_analysis);
        }
        domains_transfer_lock.regions = { global : allDomainAnalysis};
        return { domains_transfer_lock };
    }
}