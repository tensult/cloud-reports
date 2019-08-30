import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2RouteTablesCollector extends BaseCollector {
    public async collect(callback: (err?: Error,data?: any)=>void) {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const route_tables = {};

        for (const region of ec2Regions) {
            try {
                route_tables[region]=[];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const routeTablesResponse: AWS.EC2.DescribeRouteTablesResult = await ec2.describeRouteTables().promise();
                route_tables[region] = route_tables[region].concat(routeTablesResponse.RouteTables);                    
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { route_tables };
    }
}
