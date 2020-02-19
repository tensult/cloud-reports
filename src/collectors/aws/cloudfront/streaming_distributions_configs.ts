import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { StreamingDistributionsCollector } from "./streaming_distributions";

import { IDictionary } from "../../../types";

export class StreamingDistributionConfigsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllStreamingDistributionConfigs();
  }

  private async listAllStreamingDistributionConfigs() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      const streaming_distributions_collector = new StreamingDistributionsCollector();
      streaming_distributions_collector.setSession(this.getSession());
      const streaming_distribution_data = await CollectorUtil.cachedCollect(
        streaming_distributions_collector
      );
      const streaming_distribution_configs = {};
      for (const streaming_distribution of streaming_distribution_data.streaming_distributions) {
        const cloudfrontStreamingDistributionsData: AWS.CloudFront.GetStreamingDistributionConfigResult = await cloudfront
          .getStreamingDistributionConfig({ Id: streaming_distribution.Id })
          .promise();
        streaming_distribution_configs[streaming_distribution.Id] =
          cloudfrontStreamingDistributionsData.StreamingDistributionConfig;
        await CommonUtil.wait(200);
      }
      return { streaming_distribution_configs };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
