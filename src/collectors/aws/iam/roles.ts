import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class RolesCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllRoles();
    }

    private async listAllRoles() {
        const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
        let fetchPending = true;
        let marker: string | undefined = undefined;
        let roles: AWS.IAM.Role[] = [];
        while (fetchPending) {
            let iamRolesData: AWS.IAM.ListRolesResponse = await iam.listRoles({ Marker: marker }).promise();
            roles = roles.concat(iamRolesData.Roles);
            marker = iamRolesData.Marker;
            fetchPending = iamRolesData.IsTruncated === true;
        }
        roles.forEach((role) => {
            if (role.AssumeRolePolicyDocument) {
                let decodedPolicy = decodeURIComponent(role.AssumeRolePolicyDocument);
                role.AssumeRolePolicyDocument = JSON.parse(decodedPolicy);
            }
        });
        return { roles };
    }
}

