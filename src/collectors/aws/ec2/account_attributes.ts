import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EC2AccountAttributesCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const account_attributes = {};
        for (const region of ec2Regions) {
            try {
                account_attributes[region] = [];
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const accountAttributesResponse: AWS.EC2.DescribeAccountAttributesResult =
                    await ec2.describeAccountAttributes().promise();
                account_attributes[region] =
                    account_attributes[region].concat(accountAttributesResponse.AccountAttributes);
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { account_attributes };
    }
}
