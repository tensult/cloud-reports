import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class RDSReservedInstancesCollector extends BaseCollector {
    collect() {
        return this.getAllInstances();
    }

    private async getAllInstances() {

        const serviceName = 'RDS';
        const rdsRegions = this.getRegions(serviceName);
        const reserved_instances = {};

        for (let region of rdsRegions) {
            try {
                let rds = this.getClient(serviceName, region) as AWS.RDS;
                let fetchPending = true;
                let marker: string | undefined = undefined;
                reserved_instances[region] = [];
                while (fetchPending) {
                    const instancesResponse: AWS.RDS.ReservedDBInstanceMessage = await rds.describeReservedDBInstances({Marker: marker}).promise();
                    if (instancesResponse && instancesResponse.ReservedDBInstances) {
                        reserved_instances[region] = reserved_instances[region].concat(instancesResponse.ReservedDBInstances);
                    }
                    marker = instancesResponse.Marker;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { reserved_instances };
    }
}