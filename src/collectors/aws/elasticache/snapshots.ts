import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ElastiCacheSnapshotsCollector extends BaseCollector 
{
    public collect(callback: (err?: Error, data?: any) => void)
    {
        return this.getAllSnapshots();
    }

    private async getAllSnapshots()
    {
        const self = this;
        const serviceName = "ElastiCache";
        const elastiCacheRegions = self.getRegions(serviceName);
        const snapshots = {};

        for (const region of elastiCacheRegions)
        {
            try
            {
                const elasticache  = self.getClient(serviceName, region) as AWS.ElastiCache;
                snapshots[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending)
                {
                    const snapshotsResponse: AWS.ElastiCache.Types.DescribeSnapshotsMessage = await elasticache.describeSnapshots
                        ({ Marker: marker }).promise();
                    snapshots[region] = snapshots[region].concat(snapshotsResponse.SnapshotName);
                    marker = snapshotsResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) 
            {
                AWSErrorHandler.handle(error);
            }
        }
        // console.log(snapshots);
        return { snapshots };
    }
}