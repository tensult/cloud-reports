import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { aws } from "../../../analyzers";

export class RedshiftNodeReservationCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllReservedNodes();
    }

    private async getAllReservedNodes() {

        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const ReservedNodes = {};

        for (const region of redshiftRegions) {
            try {
                const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                ReservedNodes[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const RedshiftReservedNode:
                        AWS.Redshift.Types.ReservedNodesMessage = await redshift.describeReservedNodes
                            ({ Marker: marker }).promise();
                            ReservedNodes[region] = ReservedNodes[region].concat(RedshiftReservedNode.ReservedNodes);
                    marker = RedshiftReservedNode.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }        
        return { ReservedNodes};
    }
}
