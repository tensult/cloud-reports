import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElastiCacheParameterGroupsCollector extends BaseCollector 
{
    public collect(callback: (err?: Error, data?: any) => void)
    {
        return this.getAllCacheParameterGroups();
    }

    private async getAllCacheParameterGroups()
    {
        const self = this;
        const serviceName = "ElastiCache";
        const elastiCacheRegions = self.getRegions(serviceName);
        const cache_parameter_groups = {};

        for (const region of elastiCacheRegions)
        {
            try
            {
                const elasticache  = self.getClient(serviceName, region) as AWS.ElastiCache;
                cache_parameter_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending)
                {
                    const cacheParameterGroupsResponse: AWS.ElastiCache.Types.CacheParameterGroupsMessage = await elasticache.describeCacheParameterGroups
                        ({ Marker: marker }).promise();
                    cache_parameter_groups[region] = cache_parameter_groups[region].concat(cacheParameterGroupsResponse.CacheParameterGroups);
                    marker = cacheParameterGroupsResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) 
            {
                AWSErrorHandler.handle(error);
            }
        }
        return { cache_parameter_groups };
    }
}