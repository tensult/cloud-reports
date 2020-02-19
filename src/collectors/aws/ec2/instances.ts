import * as AWS from "aws-sdk";
import * as Moment from "moment";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class EC2InstancesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllInstances();
  }

  private async getAllInstances() {
    const serviceName = "EC2";
    const ec2Regions = this.getRegions(serviceName);
    const instances = {};

    for (const region of ec2Regions) {
      try {
        const ec2 = this.getClient(serviceName, region) as AWS.EC2;
        instances[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const instancesResponse: AWS.EC2.DescribeInstancesResult = await ec2
            .describeInstances({ NextToken: marker })
            .promise();
          if (instancesResponse && instancesResponse.Reservations) {
            instances[region] = instances[region].concat(
              instancesResponse.Reservations.reduce(
                (
                  instancesFromReservations: AWS.EC2.Instance[],
                  reservation
                ) => {
                  if (!reservation.Instances) {
                    return instancesFromReservations;
                  } else {
                    return instancesFromReservations.concat(
                      reservation.Instances
                    );
                  }
                },
                []
              )
            );
            marker = instancesResponse.NextToken;
            fetchPending = marker !== undefined && marker !== null;
            await CommonUtil.wait(200);
          } else {
            fetchPending = false;
          }
        }
        for (const instance of instances[region]) {
          if (instance.hasOwnProperty("BlockDeviceMappings")) {
            for (const blockDeviceMap of instance.BlockDeviceMappings) {
              blockDeviceMap.Ebs.Snapshots = await this.getSnapshotsByVolume(
                ec2,
                blockDeviceMap.Ebs.VolumeId
              );
            }
          }
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }

    return { instances };
    // change instances
  }

  private async getSnapshotsByVolume(ec2Obj: AWS.EC2, volumeId: string) {
    let snapshots = [] as any;
    let fetchPending = true;
    let marker: string | undefined;
    const dataStringsToSearch = CommonUtil.removeDuplicates([
      this.getDateStringForSearch(30),
      this.getDateStringForSearch(0)
    ]);
    while (fetchPending) {
      const params: AWS.EC2.DescribeSnapshotsRequest = {
        Filters: [
          { Name: "volume-id", Values: [volumeId] },
          { Name: "start-time", Values: dataStringsToSearch },
          { Name: "status", Values: ["completed"] }
        ],
        NextToken: marker
      };
      const response: AWS.EC2.DescribeSnapshotsResult = await ec2Obj
        .describeSnapshots(params)
        .promise();
      marker = response.NextToken;
      fetchPending = marker !== undefined && marker !== null;
      snapshots = snapshots.concat(response.Snapshots);
    }
    return snapshots;
  }

  private getDateStringForSearch(beforeDays: number) {
    return Moment()
      .subtract(beforeDays, "days")
      .format("YYYY-MM-*");
  }
}
