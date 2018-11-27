import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { Dictionary } from "../../../types";
import { CollectorUtil } from "../../../utils";
import { GroupsCollector } from './groups';
import { AWSErrorHandler } from '../../../utils/aws';

export class GroupUsersCollector extends BaseCollector {
    collect() {
        return this.listUsers();
    }

    private async listUsers() {
        const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
        const groupsCollector = new GroupsCollector();
        groupsCollector.setSession(this.getSession());
        const group_users: Dictionary<AWS.IAM.User[]> = {};

        try {
            const groupsData = await CollectorUtil.cachedCollect(groupsCollector);
            const groups: AWS.IAM.Group[] = groupsData.groups;
            for (let i = 0; i < groups.length; i++) {
                try {
                    const groupName = groups[i].GroupName
                    let fetchPending = true;
                    let marker: string | undefined;
                    let groupUsers: AWS.IAM.User[] = [];
                    while (fetchPending) {
                        let params: AWS.IAM.GetGroupRequest = { GroupName: groupName }
                        if (marker) {
                            params.Marker = marker;
                        }
                        let groupData: AWS.IAM.GetGroupResponse = await iam.getGroup(params).promise();
                        if (groupData.Users) {
                            groupUsers = groupUsers.concat(groupData.Users);
                        }
                        marker = groupData.Marker;
                        fetchPending = groupData.IsTruncated === true
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