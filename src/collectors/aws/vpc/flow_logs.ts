import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class FlowLogsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllFlowLogs();
  }

  private async getAllFlowLogs() {
    const self = this;

    const serviceName = "EC2";
    const ec2Regions = self.getRegions(serviceName);
    const flow_logs = {};

    for (const region of ec2Regions) {
      try {
        const ec2 = self.getClient(serviceName, region) as AWS.EC2;
        flow_logs[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const flowLogsResponse: AWS.EC2.DescribeFlowLogsResult = await ec2
            .describeFlowLogs({ NextToken: marker })
            .promise();
          if (flowLogsResponse && flowLogsResponse.FlowLogs) {
            flow_logs[region] = flow_logs[region].concat(
              flowLogsResponse.FlowLogs
            );
            marker = flowLogsResponse.NextToken;
            fetchPending = marker !== undefined;
            await CommonUtil.wait(200);
          } else {
            fetchPending = false;
          }
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { flow_logs };
  }
}
