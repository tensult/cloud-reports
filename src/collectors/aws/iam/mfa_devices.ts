import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { UsersCollector } from "./users";

export class MFADevicesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listMfaDevices();
  }

  private async listMfaDevices() {
    try {
      const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
      const usersCollector = new UsersCollector();
      usersCollector.setSession(this.getSession());
      const mfa_devices: IDictionary<AWS.IAM.MFADevice[]> = {};

      const usersData = await CollectorUtil.cachedCollect(usersCollector);
      const users: AWS.IAM.User[] = usersData.users;
      for (const user of users) {
        const userName = user.UserName;
        let fetchPending = true;
        let marker: string | undefined;
        let userMfaDevices: AWS.IAM.MFADevice[] = [];
        while (fetchPending) {
          const iamMfaDevicesData: AWS.IAM.ListMFADevicesResponse = await iam
            .listMFADevices({ Marker: marker, UserName: userName })
            .promise();
          userMfaDevices = userMfaDevices.concat(iamMfaDevicesData.MFADevices);
          marker = iamMfaDevicesData.Marker;
          fetchPending = iamMfaDevicesData.IsTruncated === true;
          await CommonUtil.wait(200);
        }
        mfa_devices[userName] = userMfaDevices;
      }
      return { mfa_devices };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
