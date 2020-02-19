import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class AlarmsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllAlarms();
  }
  private async getAllAlarms() {
    const self = this;
    const serviceName = "CloudWatch";
    const CloudWatchRegions = self.getRegions(serviceName);
    const alarms = {};
    for (const region of CloudWatchRegions) {
      try {
        const CloudWatchService = self.getClient(
          serviceName,
          region
        ) as AWS.CloudWatch;
        alarms[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const alarmsResponse: AWS.CloudWatch.Types.DescribeAlarmsOutput = await CloudWatchService.describeAlarms(
            { NextToken: marker }
          ).promise();
          if (alarmsResponse.MetricAlarms) {
            alarms[region] = alarms[region].concat(alarmsResponse.MetricAlarms);
          }
          marker = alarmsResponse.NextToken;
          fetchPending = marker !== undefined;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { alarms };
  }
}
