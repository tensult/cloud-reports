import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElastiCacheReservedCacheNodesCollector extends BaseCollector 
{
    public collect(callback: (err?: Error, data?: any) => void)
    {
        return this.getAllReservedCacheNodes();
    }

    private async getAllReservedCacheNodes()
    {
        const self = this;
        const serviceName = "ElastiCache";
        const elastiCacheRegions = self.getRegions(serviceName);
        const reserved_cache_nodes = {};

        for (const region of elastiCacheRegions)
        {
            try
            {
                const elasticache  = self.getClient(serviceName, region) as AWS.ElastiCache;
                reserved_cache_nodes[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending)
                {
                    const reservedCacheNodesResponse: AWS.ElastiCache.Types.ReservedCacheNodeMessage = await elasticache.describeReservedCacheNodes
                        ({ Marker: marker }).promise();
                    reserved_cache_nodes[region] = reserved_cache_nodes[region].concat(reservedCacheNodesResponse.ReservedCacheNodes);
                    marker = reservedCacheNodesResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) 
            {
                AWSErrorHandler.handle(error);
            }
        }
        return { reserved_cache_nodes };
    }
}