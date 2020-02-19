import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { CertificateCollector } from "./certificates";

import { IDictionary } from "../../../types";

export class CertificateDetailsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllCertificateDetails();
  }

  private async getAllCertificateDetails() {
    const self = this;
    const serviceName = "ACM";
    const acmRegions = self.getRegions(serviceName);
    const certificateCollector = new CertificateCollector();
    certificateCollector.setSession(this.getSession());
    const certificate_details = {};
    try {
      const certificatesData = await CollectorUtil.cachedCollect(
        certificateCollector
      );
      const certificates = certificatesData.certificates;
      for (const region of acmRegions) {
        try {
          const acmService = self.getClient(serviceName, region) as AWS.ACM;
          const regionCertificates = certificates[region];
          this.context[region] = region;

          const allRegionCertificateDetails: AWS.ACM.CertificateDetail[] = [];
          for (const certificate of regionCertificates) {
            const regionCertificateDetails: AWS.ACM.DescribeCertificateResponse = await acmService
              .describeCertificate({
                CertificateArn: certificate.CertificateArn
              })
              .promise();
            if (regionCertificateDetails.Certificate) {
              allRegionCertificateDetails.push(
                regionCertificateDetails.Certificate
              );
            }
          }
          certificate_details[region] = allRegionCertificateDetails;
          await CommonUtil.wait(200);
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
