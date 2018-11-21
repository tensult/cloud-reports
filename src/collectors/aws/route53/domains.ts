import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class DomainsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllDomains();
    }

    private async listAllDomains() {
        try {
            const route53 = this.getClient('Route53Domains', 'us-east-1') as AWS.Route53Domains;
            let fetchPending = true;
            let marker: string | undefined = undefined;
            let domains: AWS.Route53Domains.DomainSummary[] = [];
            while (fetchPending) {
                let route53DomainsData: AWS.Route53Domains.ListDomainsResponse = await route53.listDomains({ Marker: marker }).promise();
                domains = domains.concat(route53DomainsData.Domains);
                marker = route53DomainsData.NextPageMarker;
                fetchPending = marker !== undefined;
            }
            return { domains };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}