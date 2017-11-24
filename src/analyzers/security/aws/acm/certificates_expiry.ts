import { BaseAnalyzer } from '../../../base'
import { CheckAnalysisResult, Dictionary, ResourceAnalysisResult, SeverityStatus } from '../../../../types';

const millsIn30Days = 30 * 24 * 60 * 60 * 1000;
export class CertificatesExpiryAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allCertificates = params.certificate_details;
        if (!allCertificates) {
            return undefined;
        }
        const certificates_expiry: CheckAnalysisResult = {};
        certificates_expiry.what = "Are certificates expiring soon?";
        certificates_expiry.why = "Expired certificates can make services inaccessible for your customers."
        certificates_expiry.recommendation = "Recommended to enable AutoRenew option or renew manually before certificates expiry";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allCertificates) {
            allRegionsAnalysis[region] = [];
            let regionCertificates = allCertificates[region];
            for (let certificate of regionCertificates) {
                let certificate_analysis: ResourceAnalysisResult = {};
                certificate_analysis.resource = {
                    DomainName: certificate.DomainName,
                    CertificateArn: certificate.CertificateArn
                }
                certificate_analysis.resourceSummary = {
                    name: 'Certificate',
                    value:  `${certificate.DomainName} | ${this.getCertificateId(certificate.CertificateArn)}`
                };
                let expirationTime = new Date(certificate.NotAfter);
                let dateAfter30Days = new Date(Date.now() + millsIn30Days);
                let dateAfter90Days = new Date(Date.now() + 3 * millsIn30Days);
                if (expirationTime < new Date()) {
                    certificate_analysis.severity = SeverityStatus.Failure;
                    certificate_analysis.message = "Certificate is expired";
                    certificate_analysis.action = "Renew the certificate or remove it if no longer needed"
                } else if (expirationTime < dateAfter30Days) {
                    certificate_analysis.severity = SeverityStatus.Warning;
                    certificate_analysis.message = "Certicate is expiring within a month";
                    certificate_analysis.action = "Renew the certificate immediately"
                } else if (expirationTime < dateAfter90Days) {
                    certificate_analysis.severity = SeverityStatus.Ok;
                    certificate_analysis.message = "Certicate is expiring within 3 months";
                    certificate_analysis.action = "Plan for its renewal"
                } else {
                    certificate_analysis.severity = SeverityStatus.Good;
                    certificate_analysis.message = "Certicate is valid for more than 3 months";
                }
                allRegionsAnalysis[region].push(certificate_analysis);
            }
        }
        certificates_expiry.regions = allRegionsAnalysis;
        return { certificates_expiry };
    }

    private getCertificateId(certificateArn: string) {
        return certificateArn.split('/').pop();
    }
}