import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class ESDomainNamesCollector extends BaseCollector {
    collect() {
        return this.getAllDomains();
    }

    private async getAllDomains() {

        const serviceName = 'ES';
        const esRegions = this.getRegions(serviceName);
        const domain_names = {};

        for (let region of esRegions) {
            try {
                let es = this.getClient(serviceName, region) as AWS.ES;
                const domainsResponse: AWS.ES.ListDomainNamesResponse = await es.listDomainNames().promise();
                if (domainsResponse && domainsResponse.DomainNames) {
                    domain_names[region] = domainsResponse.DomainNames.map((domain) => {
                        return domain.DomainName;
                    });
                }
            } catch (error) {
                console.error(error);
                continue;
            }
        }
        return { domain_names };
    }
}