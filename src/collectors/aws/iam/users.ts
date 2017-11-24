import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class UsersCollector extends BaseCollector {
    collect() {
        return this.listAllUsers();
    }

    private async listAllUsers() {
        const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
        let fetchPending = true;
        let marker: string | undefined = undefined;
        let users: AWS.IAM.User[] = [];
        while (fetchPending) {
            let iamUsersData: AWS.IAM.ListUsersResponse = await iam.listUsers({ Marker: marker }).promise();
            users = users.concat(iamUsersData.Users);
            marker = iamUsersData.Marker;
            fetchPending = iamUsersData.IsTruncated === true;
        }
        return { users };
    }
}