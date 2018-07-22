import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class RDSInstancesCollector extends BaseCollector {
    collect() {
        return this.getAllInstances();
    }

    private async getAllInstances() {

        const self = this;

        const serviceName = 'RDS';
        const rdsRegions = self.getRegions(serviceName);
        const instances = {};

        for (let region of rdsRegions) {
            try {
                let rds = self.getClient(serviceName, region) as AWS.RDS;
                instances[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const instancesResponse: AWS.RDS.DBInstanceMessage = await rds.describeDBInstances({ Marker: marker }).promise();
                    instances[region] = instances[region].concat(instancesResponse.DBInstances);
                    marker = instancesResponse.Marker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { instances };
    }
}