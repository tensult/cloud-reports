import * as AWS from "aws-sdk";
import { CommonUtil, CsvUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class CredentialsReportCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getCredentialsReport();
  }

  private async getCredentialsReport() {
    try {
      const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
      let fetchPending = true;
      let credsReport: AWS.IAM.GetCredentialReportResponse = {};
      await iam.generateCredentialReport().promise();
      while (fetchPending) {
        await CommonUtil.wait(5000);
        credsReport = await iam.getCredentialReport().promise();
        fetchPending = credsReport.Content === undefined;
      }
      let credentials = {};
      if (credsReport.Content) {
        credentials = CsvUtil.toObject(credsReport.Content.toString());
      }
      return { credentials };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
