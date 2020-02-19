import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class RDSReservedInstancesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllInstances();
  }

  private async getAllInstances() {
    const serviceName = "RDS";
    const rdsRegions = this.getRegions(serviceName);
    const reserved_instances = {};

    for (const region of rdsRegions) {
      try {
        const rds = this.getClient(serviceName, region) as AWS.RDS;
        let fetchPending = true;
        let marker: string | undefined;
        reserved_instances[region] = [];
        this.context[region] = region;

        while (fetchPending) {
          const instancesResponse: AWS.RDS.ReservedDBInstanceMessage = await rds
            .describeReservedDBInstances({ Marker: marker })
            .promise();
          if (instancesResponse && instancesResponse.ReservedDBInstances) {
            reserved_instances[region] = reserved_instances[region].concat(
              instancesResponse.ReservedDBInstances
            );
          }
          marker = instancesResponse.Marker;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { reserved_instances };
  }
}
