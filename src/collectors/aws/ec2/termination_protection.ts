import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { EC2InstancesCollector } from "./instances";

import { IDictionary } from "../../../types";

export class TerminationProtectionCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getTerminationProtectionStatus();
  }

  private async getTerminationProtectionStatus() {
    const serviceName = "EC2";
    const ec2Regions = this.getRegions(serviceName);
    const termination_protection = {};
    const ec2InstancesCollector = new EC2InstancesCollector();
    ec2InstancesCollector.setSession(this.getSession());
    try {
      const instancesData = await CollectorUtil.cachedCollect(
        ec2InstancesCollector
      );
      const instances = instancesData.instances;
      for (const region of ec2Regions) {
        try {
          const ec2 = this.getClient(serviceName, region) as AWS.EC2;
          termination_protection[region] = {};
          this.context[region] = region;

          for (const instance of instances[region]) {
            const instanceAttributeResponse: AWS.EC2.InstanceAttribute = await ec2
              .describeInstanceAttribute({
                Attribute: "disableApiTermination",
                InstanceId: instance.InstanceId
              })
              .promise();
            termination_protection[region][instance.InstanceId] =
              instanceAttributeResponse.DisableApiTermination;
            await CommonUtil.wait(200);
          }
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { termination_protection };
  }
}
