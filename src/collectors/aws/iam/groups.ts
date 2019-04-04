import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { CommonUtil } from "../../../utils";

export class GroupsCollector extends BaseCollector {
    public collect() {
        return this.listAllGroups();
    }

    private async listAllGroups() {
        try {
            const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
            let fetchPending = true;
            let marker: string | undefined;
            let groups: AWS.IAM.Group[] = [];
            while (fetchPending) {
                const iamGroupsData: AWS.IAM.ListGroupsResponse = await iam.listGroups({ Marker: marker }).promise();
                groups = groups.concat(iamGroupsData.Groups);
                marker = iamGroupsData.Marker;
                fetchPending = iamGroupsData.IsTruncated === true;
                await CommonUtil.wait(200);
            }
            return { groups };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
