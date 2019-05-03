import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftClusterSubnetGroupsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusterSubnetGroups();
    }

    private async getAllClusterSubnetGroups() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const clusterSubnetGroups = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                clusterSubnetGroups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftSubnetGroupsResponse:
                        AWS.Redshift.Types.ClusterSubnetGroupMessage = await redshift.describeClusterSubnetGroups
                            ({ Marker: marker }).promise();
                    clusterSubnetGroups[region] = clusterSubnetGroups[region].concat(RedshiftSubnetGroupsResponse.ClusterSubnetGroups);
                    marker = RedshiftSubnetGroupsResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { clusterSubnetGroups };
    }
}
