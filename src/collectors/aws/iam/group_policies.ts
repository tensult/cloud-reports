import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { Dictionary } from "../../../types";
import { CollectorUtil } from "../../../utils";
import { GroupsCollector } from './groups';
import { LogUtil } from '../../../utils/log';

export class GroupPoliciesCollector extends BaseCollector {
    collect() {
        return this.listPolicies();
    }

    private async listPolicies() {
        const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
        const groupsCollector = new GroupsCollector();
        groupsCollector.setSession(this.getSession());
        const groupsData = await CollectorUtil.cachedCollect(groupsCollector);
        const groups: AWS.IAM.Group[] = groupsData.groups;
        const group_policies: Dictionary<AWS.IAM.AttachedPolicy[]> = {};
        for (let i = 0; i < groups.length; i++) {
            try {
                const groupName = groups[i].GroupName
                let fetchPending = true;
                let marker: string | undefined;
                let groupPolicies: AWS.IAM.AttachedPolicy[] = [];
                while (fetchPending) {
                    let params: AWS.IAM.ListAttachedGroupPoliciesRequest = { GroupName: groupName }
                    if (marker) {
                        params.Marker = marker;
                    }
                    let policiesData: AWS.IAM.ListAttachedGroupPoliciesResponse = await iam.listAttachedGroupPolicies(params).promise();
                    if (policiesData.AttachedPolicies) {
                        groupPolicies = groupPolicies.concat(policiesData.AttachedPolicies);
                    }
                    marker = policiesData.Marker;
                    fetchPending = policiesData.IsTruncated === true
                }
                group_policies[groupName] = groupPolicies;
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { group_policies };
    }
}