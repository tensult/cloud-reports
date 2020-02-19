import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class RolesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllRoles();
  }

  private async listAllRoles() {
    try {
      const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
      let fetchPending = true;
      let marker: string | undefined;
      let roles: AWS.IAM.Role[] = [];
      while (fetchPending) {
        const iamRolesData: AWS.IAM.ListRolesResponse = await iam
          .listRoles({ Marker: marker })
          .promise();
        roles = roles.concat(iamRolesData.Roles);
        marker = iamRolesData.Marker;
        fetchPending = iamRolesData.IsTruncated === true;
        await CommonUtil.wait(200);
      }
      roles.forEach(role => {
        if (role.AssumeRolePolicyDocument) {
          const decodedPolicy = decodeURIComponent(
            role.AssumeRolePolicyDocument
          );
          role.AssumeRolePolicyDocument = JSON.parse(decodedPolicy);
        }
      });
      return { roles };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
