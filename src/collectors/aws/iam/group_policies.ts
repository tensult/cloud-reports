import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { GroupsCollector } from "./groups";

export class GroupPoliciesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listPolicies();
  }

  private async listPolicies() {
    const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
    const groupsCollector = new GroupsCollector();
    groupsCollector.setSession(this.getSession());
    const group_policies: IDictionary<AWS.IAM.AttachedPolicy[]> = {};
    try {
      const groupsData = await CollectorUtil.cachedCollect(groupsCollector);
      const groups: AWS.IAM.Group[] = groupsData.groups;
      for (const group of groups) {
        try {
          const groupName = group.GroupName;
          let fetchPending = true;
          let marker: string | undefined;
          let groupPolicies: AWS.IAM.AttachedPolicy[] = [];
          while (fetchPending) {
            const params: AWS.IAM.ListAttachedGroupPoliciesRequest = {
              GroupName: groupName
            };
            if (marker) {
              params.Marker = marker;
            }
            const policiesData: AWS.IAM.ListAttachedGroupPoliciesResponse = await iam
              .listAttachedGroupPolicies(params)
              .promise();
            if (policiesData.AttachedPolicies) {
              groupPolicies = groupPolicies.concat(
                policiesData.AttachedPolicies
              );
            }
            marker = policiesData.Marker;
            fetchPending = policiesData.IsTruncated === true;
            await CommonUtil.wait(200);
          }
          group_policies[groupName] = groupPolicies;
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { group_policies };
  }
}
