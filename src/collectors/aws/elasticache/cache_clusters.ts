import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElastiCacheClustersCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusters();
    }

    private async getAllClusters() {

        const self = this;
        const serviceName = "ElastiCache";
        const elastiCacheRegions = self.getRegions(serviceName);
        const cache_clusters = {};

        for (const region of elastiCacheRegions) {
            try {
                const elasticache = self.getClient(serviceName, region) as AWS.ElastiCache;
                cache_clusters[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const cacheClustersResponse:
                        AWS.ElastiCache.Types.CacheClusterMessage = await elasticache.describeCacheClusters
                            ({ Marker: marker }).promise();
                    cache_clusters[region] = cache_clusters[region].concat(cacheClustersResponse.CacheClusters);
                    marker = cacheClustersResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { cache_clusters };
    }
}
