import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class SnapshotsCollector extends BaseCollector {
    collect() {
        return this.getAllSnapshots();
    }

    private async getAllSnapshots() {

        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const snapshots = {};

        for (let region of ec2Regions) {
            let ec2 = this.getClient(serviceName, region) as AWS.EC2;
            snapshots[region] = [];
            let fetchPending = true;
            let marker: string | undefined = undefined;
            while (fetchPending) {
                const snapshotsResponse: AWS.EC2.DescribeSnapshotsResult = await ec2.describeSnapshots({ NextToken: marker }).promise();
                if (snapshotsResponse.Snapshots) {
                    snapshots[region] = snapshots[region].concat(snapshotsResponse.Snapshots);
                }
                marker = snapshotsResponse.NextToken;
                fetchPending = marker !== undefined;
            }
        }
        return { snapshots };

    }
}