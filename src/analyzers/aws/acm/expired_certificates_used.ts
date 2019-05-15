import {
    CheckAnalysisType, ICheckAnalysisResult,
    IDictionary, IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";
import { CertificatesExpiryAnalyzer } from "./certificates_expiry";

export class ExpiredCertificatesUsedAnalyzer extends BaseAnalyzer {
    public  checks_what:string = "Are there any expired certificates in use?";
    public  checks_why:string = `Expired certificates can make services
    inaccessible for your customers so they shouldn't used`;
    public checks_name = "Certificate";
    public checks_recommendation = `Recommended to remove the expired certificates from usage`;
    public analyze(params: any, fullReport?: any): any {
        const allCertificates = params.certificate_details;
        if (!allCertificates) {
            return undefined;
        }
        const expired_certificates_used: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        expired_certificates_used.what = this.checks_what;
        expired_certificates_used.why = this.checks_why;
        expired_certificates_used.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allCertificates) {
            allRegionsAnalysis[region] = [];
            const regionCertificates = allCertificates[region];
            for (const certificate of regionCertificates) {
                const certificate_analysis: IResourceAnalysisResult = {};
                certificate_analysis.resource = {
                    AssociatedResources: certificate.InUseBy,
                    CertificateArn: certificate.CertificateArn,
                    DomainName: certificate.DomainName,
                };
                certificate_analysis.resourceSummary = {
                    name: this.checks_name,
                    value: `${certificate.DomainName} | ${this.getCertificateId(certificate.CertificateArn)}`,
                };

                if (certificate.Status !== "EXPIRED") {
                    continue;
                }

                if (certificate.InUseBy && certificate.InUseBy.length > 0) {
                    certificate_analysis.severity = SeverityStatus.Failure;
                    certificate_analysis.message = "Expired Certificate is use: " + certificate.InUseBy.join(" ");
                    certificate_analysis.action = "Update the resource certificate";
                } else {
                    certificate_analysis.severity = SeverityStatus.Info;
                    certificate_analysis.message = "Expired Certificates can cause confusion";
                    certificate_analysis.action = "Delete the expired certificate";
                }
                allRegionsAnalysis[region].push(certificate_analysis);
            }
        }
        expired_certificates_used.regions = allRegionsAnalysis;
        return { expired_certificates_used };
    }

    private getCertificateId(certificateArn: string) {
        return certificateArn.split("/").pop();
    }
}
