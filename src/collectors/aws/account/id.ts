import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { CredentialsReportCollector } from "../iam";

import { IDictionary } from "../../../types";

export class AccountIdCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAccountId();
  }

  private async getAccountId() {
    try {
      const credentialsReportCollector = new CredentialsReportCollector();
      credentialsReportCollector.setSession(this.getSession());
      const credsReportData = await CollectorUtil.cachedCollect(
        credentialsReportCollector
      );
      if (credsReportData.credentials) {
        const rootAccountDetails = credsReportData.credentials.find(
          credential => {
            return credential.user === "<root_account>";
          }
        );
        if (rootAccountDetails) {
          return { id: this.getAccountIdFromArn(rootAccountDetails.arn) };
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }

  private getAccountIdFromArn(arn) {
    return arn.split(":")[4];
  }
}
