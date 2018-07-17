import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class GroupsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllGroups();
    }

    private async listAllGroups() {
        try {
            const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
            let fetchPending = true;
            let marker: string | undefined = undefined;
            let groups: AWS.IAM.Group[] = [];
            while (fetchPending) {
                let iamGroupsData: AWS.IAM.ListGroupsResponse = await iam.listGroups({ Marker: marker }).promise();
                groups = groups.concat(iamGroupsData.Groups);
                marker = iamGroupsData.Marker;
                fetchPending = iamGroupsData.IsTruncated === true;
            }
            return { groups };
        } catch (error) {
            console.error(error);
        }
    }
}