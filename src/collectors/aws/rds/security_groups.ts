import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class RDSSecurityGroupsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllSecurityGroups();
    }

    private async getAllSecurityGroups() {

        const self = this;

        const serviceName = 'RDS';
        const rdsRegions = self.getRegions(serviceName);
        const security_groups = {};

        for (let region of rdsRegions) {
            try {
                let rds = self.getClient(serviceName, region) as AWS.RDS;
                security_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const securityGroupsResponse: AWS.RDS.DBSecurityGroupMessage = await rds.describeDBSecurityGroups({ Marker: marker }).promise();
                    security_groups[region] = security_groups[region].concat(securityGroupsResponse.DBSecurityGroups);
                    marker = securityGroupsResponse.Marker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { security_groups };
    }
}