import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { GroupsCollector } from "./groups";

export class GroupUsersCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listUsers();
  }

  private async listUsers() {
    const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
    const groupsCollector = new GroupsCollector();
    groupsCollector.setSession(this.getSession());
    const group_users: IDictionary<AWS.IAM.User[]> = {};

    try {
      const groupsData = await CollectorUtil.cachedCollect(groupsCollector);
      const groups: AWS.IAM.Group[] = groupsData.groups;
      for (const group of groups) {
        try {
          const groupName = group.GroupName;
          let fetchPending = true;
          let marker: string | undefined;
          let groupUsers: AWS.IAM.User[] = [];
          while (fetchPending) {
            const params: AWS.IAM.GetGroupRequest = { GroupName: groupName };
            if (marker) {
              params.Marker = marker;
            }
            const groupData: AWS.IAM.GetGroupResponse = await iam
              .getGroup(params)
              .promise();
            if (groupData.Users) {
              groupUsers = groupUsers.concat(groupData.Users);
            }
            marker = groupData.Marker;
            fetchPending = groupData.IsTruncated === true;
            await CommonUtil.wait(200);
          }
          group_users[groupName] = groupUsers;
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { group_users };
  }
}
