import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class SnapshotsCollector extends BaseCollector {
    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const snapshots = {};
        for (const region of ec2Regions) {
            try {
                const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                const snapshotsResponse: AWS.EC2.DescribeSnapshotsResult = await ec2.describeSnapshots().promise();
                snapshots[region] = snapshotsResponse.Snapshots;
                await CommonUtil.wait(200);
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { snapshots };
    }
}
