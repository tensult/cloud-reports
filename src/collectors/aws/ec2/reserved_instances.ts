import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class EC2ReservedInstancesCollector extends BaseCollector {
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
    const reserved_instances = {};

    for (const region of ec2Regions) {
      try {
        const ec2 = this.getClient(serviceName, region) as AWS.EC2;
        this.context[region] = region;

        const instancesResponse: AWS.EC2.DescribeReservedInstancesResult = await ec2
          .describeReservedInstances()
          .promise();
        if (instancesResponse && instancesResponse.ReservedInstances) {
          reserved_instances[region] = instancesResponse.ReservedInstances;
        }
        await CommonUtil.wait(200);
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { reserved_instances };
  }
}
