import * as AWS from "aws-sdk";
import { BaseCollector } from "../../base";
import { LogUtil } from "../../../utils/log";

export class AlarmsCollector extends BaseCollector {
  collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllAlarms();
  }
  private async getAllAlarms() {
    const self = this;
    const serviceName = 'CloudWatch';
    const CloudWatchRegions = self.getRegions(serviceName);
    const alarms = {};
    for (let region of CloudWatchRegions) {
      try {
        let CloudWatchService = self.getClient(serviceName, region) as AWS.CloudWatch;
        alarms[region] = [];
        let fetchPending = true;
        let marker: string | undefined = undefined;
        while (fetchPending) {
          const alarmsResponse: AWS.CloudWatch.Types.DescribeAlarmsOutput = await CloudWatchService.describeAlarms({ NextToken: marker }).promise();
          if (alarmsResponse.MetricAlarms) {
            alarms[region] = alarms[region].concat(alarmsResponse.MetricAlarms);
          }
          marker = alarmsResponse.NextToken;
          fetchPending = marker !== undefined;
        }
      } catch (error) {
        LogUtil.error(error);
        continue;
      }
    }
    return { alarms };
  }
}