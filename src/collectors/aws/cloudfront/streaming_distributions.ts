import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class StreamingDistributionsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllStreamingDistributions();
  }

  private async listAllStreamingDistributions() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      let fetchPending = true;
      let marker: string | undefined;
      let streaming_distributions: AWS.CloudFront.StreamingDistributionSummary[] = [];
      while (fetchPending) {
        const cloudfrontStreamingDistributionsData: AWS.CloudFront.ListStreamingDistributionsResult = await cloudfront
          .listStreamingDistributions({ Marker: marker })
          .promise();
        if (
          cloudfrontStreamingDistributionsData.StreamingDistributionList &&
          cloudfrontStreamingDistributionsData.StreamingDistributionList.Items
        ) {
          streaming_distributions = streaming_distributions.concat(
            cloudfrontStreamingDistributionsData.StreamingDistributionList.Items
          );
          marker =
            cloudfrontStreamingDistributionsData.StreamingDistributionList
              .NextMarker;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        } else {
          fetchPending = false;
        }
      }
      return { streaming_distributions };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
