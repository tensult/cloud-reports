import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class UsersCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllUsers();
  }

  private async listAllUsers() {
    try {
      const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
      let fetchPending = true;
      let marker: string | undefined;
      let users: AWS.IAM.User[] = [];
      while (fetchPending) {
        const iamUsersData: AWS.IAM.ListUsersResponse = await iam
          .listUsers({ Marker: marker })
          .promise();
        users = users.concat(iamUsersData.Users);
        marker = iamUsersData.Marker;
        fetchPending = iamUsersData.IsTruncated === true;
        await CommonUtil.wait(200);
      }
      return { users };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
