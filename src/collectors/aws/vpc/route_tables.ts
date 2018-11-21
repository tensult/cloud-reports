import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class RouteTablesCollector extends BaseCollector {

    async collect() {
        const serviceName = 'EC2';
        const ec2Regions = this.getRegions(serviceName);
        const self = this;
        const route_tables = {};
        for (let region of ec2Regions) {
            try {
                let ec2 = self.getClient(serviceName, region) as AWS.EC2;
                const routeTablesResponse: AWS.EC2.DescribeRouteTablesResult = await ec2.describeRouteTables().promise();
                route_tables[region] = routeTablesResponse.RouteTables;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { route_tables };
    }
}