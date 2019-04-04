import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class LogGroupsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllLogGroups();
    }
    private async getAllLogGroups() {
        const self = this;
        const serviceName = "CloudWatchLogs";
        const cloudWatchRegions = self.getRegions(serviceName);
        const log_groups = {};
        for (const region of cloudWatchRegions) {
            try {
                const cloudWatchService = self.getClient(serviceName, region) as AWS.CloudWatchLogs;
                log_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const logGroupsResponse: AWS.CloudWatchLogs.DescribeLogGroupsResponse =
                        await cloudWatchService.describeLogGroups({ nextToken: marker }).promise();
                    if (logGroupsResponse.logGroups) {
                        log_groups[region] = log_groups[region].concat(logGroupsResponse.logGroups);
                    }
                    marker = logGroupsResponse.nextToken;
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (err) {
                AWSErrorHandler.handle(err, region);
                continue;
            }
        }
        return { log_groups };
    }
}
