import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class VolumesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllVolumes();
  }

  private async getAllVolumes() {
    const serviceName = "EC2";
    const ec2Regions = this.getRegions(serviceName);
    const volumes = {};

    for (const region of ec2Regions) {
      try {
        const ec2 = this.getClient(serviceName, region) as AWS.EC2;
        volumes[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const volumesResponse: AWS.EC2.DescribeVolumesResult = await ec2
            .describeVolumes({ NextToken: marker })
            .promise();
          if (volumesResponse.Volumes) {
            volumes[region] = volumes[region].concat(volumesResponse.Volumes);
          }
          marker = volumesResponse.NextToken;
          fetchPending = marker !== undefined;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { volumes };
  }
}
