import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class CloudTrailsCollector extends BaseCollector {
    async collect() {
        const serviceName = 'CloudTrail';
        const cloudTrailRegions = this.getRegions(serviceName);
        const self = this;
        const cloud_trails = {};
        for (let region of cloudTrailRegions) {
            try {
                let cloudTrail = self.getClient(serviceName, region) as AWS.CloudTrail;
                const cloudTrailsResponse: AWS.CloudTrail.DescribeTrailsResponse = await cloudTrail.describeTrails().promise();
                cloud_trails[region] = cloudTrailsResponse.trailList;
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { cloud_trails };
    }
}