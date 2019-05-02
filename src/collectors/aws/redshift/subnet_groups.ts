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
        const SubnetGroups = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                SubnetGroups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftSubnetGroupResponse:
                        AWS.Redshift.Types.ClusterSubnetGroupMessage = await redshift.describeClusterSubnetGroups
                            ({ Marker: marker }).promise();
                            SubnetGroups[region] = SubnetGroups[region].concat(RedshiftSubnetGroupResponse.ClusterSubnetGroups);
                    marker = RedshiftSubnetGroupResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }        
        return { SubnetGroups};
    }
}
