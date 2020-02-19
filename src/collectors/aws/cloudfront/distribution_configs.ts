import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { DistributionsCollector } from "./distributions";

import { IDictionary } from "../../../types";

export class DistributionConfigsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllDistributionConfigs();
  }

  private async listAllDistributionConfigs() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      const distributionsCollector = new DistributionsCollector();
      distributionsCollector.setSession(this.getSession());
      const distributionData = await CollectorUtil.cachedCollect(
        distributionsCollector
      );
      const distribution_configs = {};
      for (const distribution of distributionData.distributions) {
        const cloudfrontDistributionsData: AWS.CloudFront.GetDistributionConfigResult = await cloudfront
          .getDistributionConfig({ Id: distribution.Id })
          .promise();
        distribution_configs[distribution.Id] =
          cloudfrontDistributionsData.DistributionConfig;
        await CommonUtil.wait(200);
      }
      return { distribution_configs };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
