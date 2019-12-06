import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElastiCacheSubnetGroupsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllSubnetGroups();
    }

    private async getAllSubnetGroups() {

        const self = this;
        const serviceName = "ElastiCache";
        const elastiCacheRegions = self.getRegions(serviceName);
        const cache_subnet_groups = {};

        for (const region of elastiCacheRegions) {
            try {
                const elasticache = self.getClient(serviceName, region) as AWS.ElastiCache;
                cache_subnet_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const ElastiCacheSubnetGroupResponse:
                        AWS.ElastiCache.Types.CacheSubnetGroupMessage = await elasticache.describeCacheSubnetGroups
                            ({ Marker: marker }).promise();
                    cache_subnet_groups[region] = cache_subnet_groups[region].concat(ElastiCacheSubnetGroupResponse.CacheSubnetGroups);
                    marker = ElastiCacheSubnetGroupResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }                
            }
            catch (error) {
                AWSErrorHandler.handle(error);
            }
        }        
        return { cache_subnet_groups };
    }
}