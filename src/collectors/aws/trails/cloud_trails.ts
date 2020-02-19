import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class CloudTrailsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public async collect() {
    const serviceName = "CloudTrail";
    const cloudTrailRegions = this.getRegions(serviceName);
    const self = this;
    const cloud_trails = {};
    for (const region of cloudTrailRegions) {
      try {
        const cloudTrail = self.getClient(
          serviceName,
          region
        ) as AWS.CloudTrail;
        const cloudTrailsResponse: AWS.CloudTrail.DescribeTrailsResponse = await cloudTrail
          .describeTrails()
          .promise();
        cloud_trails[region] = cloudTrailsResponse.trailList;
        await CommonUtil.wait(200);
      } catch (error) {
        AWSErrorHandler.handle(error);
      }
    }
    return { cloud_trails };
  }
}
