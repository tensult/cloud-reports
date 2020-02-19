import * as AWS from "aws-sdk";
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
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { instances };
    // change instances
  }
}
