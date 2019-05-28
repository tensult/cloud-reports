import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2ScheduledInsatncesCollector extends BaseCollector {
    public async collect(callback: (err?: Error,data?: any)=>void) {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const scheduled_instances = {};

        for (const region of ec2Regions) {
            try {
                scheduled_instances[region]=[];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const scheduledInstancesResponse: AWS.EC2.DescribeScheduledInstancesResult = await ec2.describeScheduledInstances().promise();
                scheduled_instances[region] = scheduled_instances[region].concat(scheduledInstancesResponse.ScheduledInstanceSet);                    
                await CommonUtil.wait(200);
                
            } catch (error) {
                if (error != "UnsupportedOperation: The functionality you requested is not available in this region."){
                    AWSErrorHandler.handle(error);
                    continue;
                }
            }
        }
        return { scheduled_instances };
    }
}
