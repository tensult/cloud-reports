import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftClustersSecurityCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClustersSecurity();
    }

    private async getAllClustersSecurity() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const security_details = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                security_details[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const clustersSecurityResponse:
                        AWS.Redshift.Types.ClusterSecurityGroupMessage = await redshift.describeClusterSecurityGroups
                            ({ Marker: marker }).promise();
                            security_details[region] = security_details[region].concat(clustersSecurityResponse.ClusterSecurityGroups);///change
                    marker = clustersSecurityResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        
        return { security_details };
    }
}
