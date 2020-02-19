import * as AWS from "aws-sdk";
import * as Moment from "moment";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { VolumesCollector } from "./volumes";

import { IDictionary } from "../../../types";

export class VolumeSnapshotsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllVolumeSnapshots();
  }

  private async getAllVolumeSnapshots() {
    const serviceName = "EC2";
    const ec2Regions = this.getRegions(serviceName);
    const volumesCollector = new VolumesCollector();
    volumesCollector.setSession(this.getSession());
    const snapshots = {};
    try {
      const volumesData = await CollectorUtil.cachedCollect(volumesCollector);
      const dataStringsToSearch = CommonUtil.removeDuplicates([
        this.getDateStringForSearch(30),
        this.getDateStringForSearch(0)
      ]);

      for (const region of ec2Regions) {
        try {
          const ec2 = this.getClient(serviceName, region) as AWS.EC2;
          snapshots[region] = {};
          this.context[region] = region;

          for (const volume of volumesData.volumes[region]) {
            snapshots[region][volume.VolumeId] = [];
            let fetchPending = true;
            let marker: string | undefined;
            while (fetchPending) {
              const snapshotsResponse: AWS.EC2.DescribeSnapshotsResult = await ec2
                .describeSnapshots({
                  Filters: [
                    { Name: "start-time", Values: dataStringsToSearch },
                    { Name: "volume-id", Values: [volume.VolumeId] },
                    { Name: "status", Values: ["completed"] }
                  ],
                  NextToken: marker
                })
                .promise();
              if (snapshotsResponse.Snapshots) {
                snapshots[region][volume.VolumeId] = snapshots[region][
                  volume.VolumeId
                ].concat(snapshotsResponse.Snapshots);
              }
              marker = snapshotsResponse.NextToken;
              fetchPending = marker !== undefined;
              await CommonUtil.wait(200);
            }
          }
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { snapshots };
  }

  private getDateStringForSearch(beforeDays: number) {
    return Moment()
      .subtract(beforeDays, "days")
      .format("YYYY-MM-*");
  }
}
