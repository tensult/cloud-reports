import {
    CheckAnalysisType, ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

const millsInOneDay = 24 * 60 * 60 * 1000;
export class CertificatesExpiryAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allCertificates = params.certificate_details;
        if (!allCertificates) {
            return undefined;
        }
        const certificates_expiry: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        certificates_expiry.what = "Are certificates expiring soon?";
        certificates_expiry.why = "Expired certificates can make services inaccessible for your customers.";
        certificates_expiry.recommendation = `Recommended to enable AutoRenew option or
        renew manually before certificates expiry`;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allCertificates) {
            allRegionsAnalysis[region] = [];
            const regionCertificates = allCertificates[region];
            for (const certificate of regionCertificates) {
                const certificate_analysis: IResourceAnalysisResult = {};
                certificate_analysis.resource = {
                    CertificateArn: certificate.CertificateArn,
                    DomainName: certificate.DomainName,
                };
                certificate_analysis.resourceSummary = {
                    name: "Certificate",
                    value: `${certificate.DomainName} | ${this.getCertificateId(certificate.CertificateArn)}`,
                };
                const expirationTime = new Date(certificate.NotAfter);
                const dateAfter30Days = new Date(Date.now() + 30 * millsInOneDay);
                const dateAfter90Days = new Date(Date.now() + 90 * millsInOneDay);
                if (expirationTime < new Date()) {
                    certificate_analysis.severity = SeverityStatus.Failure;
                    certificate_analysis.message = "Certificate is expired";
                    certificate_analysis.action = "Renew the certificate or remove it if no longer needed";
                } else if (expirationTime < dateAfter30Days) {
                    certificate_analysis.severity = SeverityStatus.Failure;
                    certificate_analysis.message = "Certificate is expiring within a month";
                    certificate_analysis.action = "Renew the certificate immediately";
                } else if (expirationTime < dateAfter90Days) {
                    certificate_analysis.severity = SeverityStatus.Warning;
                    certificate_analysis.message = "Certificate is expiring within 3 months";
                    certificate_analysis.action = "Plan for its renewal";
                } else {
                    certificate_analysis.severity = SeverityStatus.Good;
                    certificate_analysis.message = "Certificate is valid for more than 3 months";
                }
                allRegionsAnalysis[region].push(certificate_analysis);
            }
        }
        certificates_expiry.regions = allRegionsAnalysis;
        return { certificates_expiry };
    }

    private getCertificateId(certificateArn: string) {
        return certificateArn.split("/").pop();
    }
}
