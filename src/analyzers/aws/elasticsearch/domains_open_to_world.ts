import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class ESDomainsOpenToWorldAnalyzer extends BaseAnalyzer {
    analyze(params: any, fullReport?: any): any {
        const allDomains = params.domains;
        if (!allDomains) {
            return undefined;
        }
        const domains_open_to_world: CheckAnalysisResult = { type: CheckAnalysisType.Security };
        domains_open_to_world.what = "Are there any Elasticsearch service domains open to world?";
        domains_open_to_world.why = "Domains open to world posses serious security threat so we need to allow only intended parties to access";
        domains_open_to_world.recommendation = "Recommended to restrict domain access as per your application needs";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allDomains) {
            let regionDomains = allDomains[region];
            allRegionsAnalysis[region] = [];
            for (let domain of regionDomains) {
                let domainAnalysis: ResourceAnalysisResult = {};
                domainAnalysis.resource = domain;
                domainAnalysis.resourceSummary = {
                    name: 'Domain',
                    value: domain.DomainName
                }
                if (this.isOpenToWorld(domain)) {
                    domainAnalysis.severity = SeverityStatus.Failure;
                    domainAnalysis.message = 'Domain is open to the world';
                    domainAnalysis.action = 'Remove access policy statement containing AWS: ["*"]';
                } else {
                    domainAnalysis.severity = SeverityStatus.Good;
                    domainAnalysis.message = 'Domain is not open to the world';
                }
                allRegionsAnalysis[region].push(domainAnalysis);
            }
        }
        domains_open_to_world.regions = allRegionsAnalysis;
        return { domains_open_to_world };
    }

    private isOpenToWorld(domain: any) {
        if(!domain.AccessPolicies) {
            return false;
        }
        const accessPolicy = JSON.parse(domain.AccessPolicies);
        if(!accessPolicy.Statement || !accessPolicy.Statement.length) {
            return false;
        }
        return accessPolicy.Statement.some((statementLine) => {
            return statementLine.Principal && 
            statementLine.Principal.AWS &&
            statementLine.Principal.AWS.includes("*");
        });
    }
}