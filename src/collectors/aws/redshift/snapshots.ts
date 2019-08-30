import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftSnapshotsCollector extends BaseCollector 
{
    public collect(callback: (err?: Error, data?: any) => void)
    {
        return this.getAllSnapshots();
    }

    private async getAllSnapshots()
    {
        const self = this;
        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const snapshots = {};

        for (const region of redshiftRegions)
        {
            try
            {
                const redshift  = self.getClient(serviceName, region) as AWS.Redshift;
                snapshots[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending)
                {
                    const snapshotsResponse: AWS.Redshift.Types.SnapshotMessage = await redshift.describeClusterSnapshots
                        ({ Marker: marker }).promise();
                    snapshots[region] = snapshots[region].concat(snapshotsResponse.Snapshots);
                    marker = snapshotsResponse.Marker;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) 
            {
                AWSErrorHandler.handle(error);
            }
        }
        return {snapshots};
    }
}