import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftSubnetGroupCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllSubnetGroups();
    }

    private async getAllSubnetGroups() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const cluster_subnet_groups = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                cluster_subnet_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftSubnetGroupResponse:
                        AWS.Redshift.Types.ClusterSubnetGroupMessage = await redshift.describeClusterSubnetGroups
                            ({ Marker: marker }).promise();
                    cluster_subnet_groups[region] = cluster_subnet_groups[region].concat(RedshiftSubnetGroupResponse.ClusterSubnetGroups);
                    marker = RedshiftSubnetGroupResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }        
        return { cluster_subnet_groups };
    }
}