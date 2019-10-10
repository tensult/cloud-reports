import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2PlacementGroupsCollector extends BaseCollector {
    public collect() {
        return this.getAllPlacementGroups();
    }

    private async getAllPlacementGroups() {

        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const placement_groups = {};

        for (const region of ec2Regions) {
            try {
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const placementGroupsResponse: AWS.EC2.DescribePlacementGroupsResult =
                    await ec2.describePlacementGroups().promise();
                if (placementGroupsResponse && placementGroupsResponse.PlacementGroups) {
                    placement_groups[region] = placementGroupsResponse.PlacementGroups;
                }
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { placement_groups };
    }
}
