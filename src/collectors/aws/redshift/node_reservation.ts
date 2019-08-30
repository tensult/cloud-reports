import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftReservedNodesCollector extends BaseCollector 
{
    public collect(callback: (err?: Error, data?: any) => void)
    {
        return this.getAllReservedNodes();
    }

    private async getAllReservedNodes()
    {
        const self = this;

        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const reserved_nodes = {};

        for (const region of redshiftRegions)
        {
            try
            {
                const redshift  = self.getClient(serviceName, region) as AWS.Redshift;
                reserved_nodes[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending)
                {
                    const reservedNodesResponse: AWS.Redshift.Types.ReservedNodesMessage = await redshift.describeReservedNodes
                        ({ Marker: marker }).promise();
                    reserved_nodes[region] = reserved_nodes[region].concat(reservedNodesResponse.ReservedNodes);
                    marker = reservedNodesResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) 
            {
                AWSErrorHandler.handle(error);
            }
        }
        return {reserved_nodes};
    }
}