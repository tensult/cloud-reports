import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { UsersCollector } from "./users";

export class UserPoliciesCollector extends BaseCollector {
    public collect() {
        return this.listPolicies();
    }

    private async listPolicies() {
        try {
            const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
            const usersCollector = new UsersCollector();
            usersCollector.setSession(this.getSession());
            const user_policies: IDictionary<AWS.IAM.AttachedPolicy[]> = {};

            const usersData = await CollectorUtil.cachedCollect(usersCollector);
            const users: AWS.IAM.User[] = usersData.users;
            for (let i = 0; i < users.length; i++) {
                const userName = users[i].UserName;
                let fetchPending = true;
                let marker: string | undefined;
                let userPolicies: AWS.IAM.AttachedPolicy[] = [];
                while (fetchPending) {
                    const params: AWS.IAM.ListAttachedUserPoliciesRequest = { UserName: userName };
                    if (marker) {
                        params.Marker = marker;
                    }
                    const policiesData: AWS.IAM.ListAttachedUserPoliciesResponse = await iam.listAttachedUserPolicies(params).promise();
                    if (policiesData.AttachedPolicies) {
                        userPolicies = userPolicies.concat(policiesData.AttachedPolicies);
                    }
                    marker = policiesData.Marker;
                    fetchPending = policiesData.IsTruncated === true;
                }
                user_policies[userName] = userPolicies;
            }
            return { user_policies };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
