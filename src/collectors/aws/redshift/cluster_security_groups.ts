import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftClusterSecurityGroupsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllclusterSecurityGroups();
    }

    private async getAllclusterSecurityGroups() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const clusterSecurityGroups = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                clusterSecurityGroups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const clusterSecurityGroupsResponse:
                        AWS.Redshift.Types.ClusterSecurityGroupMessage = await redshift.describeClusterSecurityGroups
                            ({ Marker: marker }).promise();
                    clusterSecurityGroups[region] = clusterSecurityGroups[region].concat(clusterSecurityGroupsResponse.ClusterSecurityGroups);
                    marker = clusterSecurityGroupsResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { clusterSecurityGroups };
    }
}
