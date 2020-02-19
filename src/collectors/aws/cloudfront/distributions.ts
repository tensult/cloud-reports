import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class DistributionsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllDistributions();
  }

  private async listAllDistributions() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      let fetchPending = true;
      let marker: string | undefined;
      let distributions: AWS.CloudFront.DistributionSummary[] = [];
      while (fetchPending) {
        const cloudfrontDistributionsData: AWS.CloudFront.ListDistributionsResult = await cloudfront
          .listDistributions({ Marker: marker })
          .promise();
        if (
          cloudfrontDistributionsData.DistributionList &&
          cloudfrontDistributionsData.DistributionList.Items
        ) {
          distributions = distributions.concat(
            cloudfrontDistributionsData.DistributionList.Items
          );
          marker = cloudfrontDistributionsData.DistributionList.NextMarker;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        } else {
          fetchPending = false;
        }
      }
      return { distributions };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
