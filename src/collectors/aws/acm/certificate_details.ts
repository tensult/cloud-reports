import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { CertificateCollector } from "./certificates"
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class CertificateDetailsCollector extends BaseCollector {
    collect() {
        return this.getAllCertificateDetails();
    }

    private async getAllCertificateDetails() {
        const self = this;
        const serviceName = 'ACM';
        const acmRegions = self.getRegions(serviceName);
        const certificateCollector = new CertificateCollector();
        certificateCollector.setSession(this.getSession());
        const certificate_details = {};
        try {
            const certificatesData = await CollectorUtil.cachedCollect(certificateCollector);
            const certificates = certificatesData.certificates;
            for (let region of acmRegions) {
                try {
                    let acmService = self.getClient(serviceName, region) as AWS.ACM;
                    let regionCertificates = certificates[region];
                    let allRegionCertificateDetails: AWS.ACM.CertificateDetail[] = [];
                    for (let certificate of regionCertificates) {
                        let regionCertificateDetails: AWS.ACM.DescribeCertificateResponse = await acmService.describeCertificate({ CertificateArn: certificate.CertificateArn }).promise();
                        if (regionCertificateDetails.Certificate) {
                            allRegionCertificateDetails.push(regionCertificateDetails.Certificate);
                        }
                    }
                    certificate_details[region] = allRegionCertificateDetails;
                } catch (error) {
                    AWSErrorHandler.handle(error);
                    continue;
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { certificate_details };
    }
}