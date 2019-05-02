import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftClustersSecurityCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusterSecurityGroups();
    }

    private async getAllClusterSecurityGroups() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const ClusterSecurityGroups = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                ClusterSecurityGroups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const ClusterSecurityGroupsResponse:
                        AWS.Redshift.Types.ClusterSecurityGroupMessage = await redshift.describeClusterSecurityGroups
                        ({ Marker: marker }).promise();
                    ClusterSecurityGroups[region] = ClusterSecurityGroups[region].concat(ClusterSecurityGroupsResponse.ClusterSecurityGroups);///Modify
                    marker = ClusterSecurityGroupsResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { ClusterSecurityGroups };
    }
}
