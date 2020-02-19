import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class RouteTablesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public async collect() {
    const serviceName = "EC2";
    const ec2Regions = this.getRegions(serviceName);
    const self = this;
    const route_tables = {};
    for (const region of ec2Regions) {
      try {
        const ec2 = self.getClient(serviceName, region) as AWS.EC2;
        const routeTablesResponse: AWS.EC2.DescribeRouteTablesResult = await ec2
          .describeRouteTables()
          .promise();
        route_tables[region] = routeTablesResponse.RouteTables;
        await CommonUtil.wait(200);
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { route_tables };
  }
}
