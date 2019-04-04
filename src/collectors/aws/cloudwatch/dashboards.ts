import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class DashboardsCollector extends BaseCollector {
  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllDashboards();
  }
  private async getAllDashboards() {
    const self = this;
    const serviceName = "CloudWatch";
    const CloudWatchRegions = self.getRegions(serviceName);
    const dashboards = {};
    for (const region of CloudWatchRegions) {
      try {
        const cloudWatchService = self.getClient(serviceName, region) as AWS.CloudWatch;
        dashboards[region] = [];
        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const dashboardsResponse: AWS.CloudWatch.ListDashboardsOutput =
            await cloudWatchService.listDashboards({ NextToken: marker }).promise();
          if (dashboardsResponse.DashboardEntries) {
            dashboards[region] = dashboards[region].concat(dashboardsResponse.DashboardEntries);
          }
          marker = dashboardsResponse.NextToken;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { dashboards };
  }
}
