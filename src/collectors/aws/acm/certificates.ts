import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class CertificateCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllCertificates();
    }

    private async getAllCertificates() {

        const serviceName = 'ACM';
        const acmRegions = this.getRegions(serviceName);
        const certificates = {};

        for (let region of acmRegions) {
            try {
                let acm = this.getClient(serviceName, region) as AWS.ACM;
                certificates[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const certificatesResponse: AWS.ACM.ListCertificatesResponse = await acm.listCertificates({ NextToken: marker }).promise();
                    if (certificatesResponse.CertificateSummaryList) {
                        certificates[region] = certificates[region].concat(certificatesResponse.CertificateSummaryList);
                    }
                    marker = certificatesResponse.NextToken;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { certificates };
    }
}