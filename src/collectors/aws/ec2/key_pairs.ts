import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class KeyPairsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public async collect() {
    const serviceName = "EC2";
    const ec2Regions = this.getRegions(serviceName);
    const key_pairs = {};
    for (const region of ec2Regions) {
      try {
        const ec2 = this.getClient(serviceName, region) as AWS.EC2;
        this.context[region] = region;
        const keyPairsResponse: AWS.EC2.DescribeKeyPairsResult = await ec2
          .describeKeyPairs()
          .promise();
        key_pairs[region] = keyPairsResponse.KeyPairs;
        await CommonUtil.wait(200);
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { key_pairs };
  }
}
