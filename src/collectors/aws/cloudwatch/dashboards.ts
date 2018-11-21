import * as AWS from "aws-sdk";
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from "../../../utils/aws";

export class DashboardsCollector extends BaseCollector {
  collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllDashboards();
  }
  private async getAllDashboards() {
    const self = this;
    const serviceName = 'CloudWatch';
    const CloudWatchRegions = self.getRegions(serviceName);
    const dashboards = {};
    for (let region of CloudWatchRegions) {
      try {
        let cloudWatchService = self.getClient(serviceName, region) as AWS.CloudWatch;
        dashboards[region] = [];
        let fetchPending = true;
        let marker: string | undefined = undefined;
        while (fetchPending) {
          const dashboardsResponse: AWS.CloudWatch.ListDashboardsOutput = await cloudWatchService.listDashboards({ NextToken: marker }).promise();
          if (dashboardsResponse.DashboardEntries) {
            dashboards[region] = dashboards[region].concat(dashboardsResponse.DashboardEntries);
          }
          marker = dashboardsResponse.NextToken;
          fetchPending = marker !== undefined && marker !== null;
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { dashboards };
  }
}