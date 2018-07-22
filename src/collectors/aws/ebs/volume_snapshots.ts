import * as AWS from 'aws-sdk';
import * as Moment from 'moment';
import { BaseCollector } from "../../base";
import { CollectorUtil, CommonUtil } from '../../../utils';
import { VolumesCollector } from './volumes';
import { LogUtil } from '../../../utils/log';

export class VolumeSnapshotsCollector extends BaseCollector {
    collect() {
        return this.getAllVolumeSnapshots();
    }

    private async getAllVolumeSnapshots() {

        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const volumesData = await CollectorUtil.cachedCollect(new VolumesCollector());
        const snapshots = {};
        const dataStringsToSearch = CommonUtil.removeDuplicates([this.getDateStringForSearch(30), this.getDateStringForSearch(0)]);

        for (let region of ec2Regions) {
            try {
                let ec2 = this.getClient(serviceName, region) as AWS.EC2;
                snapshots[region] = {};
                for (let volume of volumesData.volumes[region]) {
                    snapshots[region][volume.VolumeId] = [];
                    let fetchPending = true;
                    let marker: string | undefined = undefined;
                    while (fetchPending) {
                        const snapshotsResponse: AWS.EC2.DescribeSnapshotsResult = await ec2.describeSnapshots({
                            Filters:
                                [
                                    { Name: "start-time", Values: dataStringsToSearch },
                                    { Name: "volume-id", Values: [volume.VolumeId] },
                                    { Name: "status", Values: ["completed"] }
                                ],
                            NextToken: marker
                        }).promise();
                        if (snapshotsResponse.Snapshots) {
                            snapshots[region][volume.VolumeId] = snapshots[region][volume.VolumeId].concat(snapshotsResponse.Snapshots);
                        }
                        marker = snapshotsResponse.NextToken;
                        fetchPending = marker !== undefined;

                    }
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { snapshots };
    }

    private getDateStringForSearch(beforeDays: number) {
        return Moment().subtract(beforeDays, "days").format("YYYY-MM-*")
    }
}