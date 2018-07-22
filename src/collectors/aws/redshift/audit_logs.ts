import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { RedshiftClustersCollector } from "."
import { CollectorUtil } from "../../../utils";
import { LogUtil } from '../../../utils/log';

export class RedshiftAuditLogsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAuditLogs();
    }

    private async getAuditLogs() {

        const self = this;

        const serviceName = 'Redshift';
        const redshiftRegions = self.getRegions(serviceName);
        const clustersData = await CollectorUtil.cachedCollect(new RedshiftClustersCollector());
        const audit_logs = {};

        for (let region of redshiftRegions) {
            try {
                let redshift = self.getClient(serviceName, region) as AWS.Redshift;
                audit_logs[region] = {};
                let regionClusters = clustersData.clusters[region];
                for (let cluster of regionClusters) {
                    const loggingStatus: AWS.Redshift.LoggingStatus = await redshift.describeLoggingStatus({ ClusterIdentifier: cluster.ClusterIdentifier }).promise();
                    audit_logs[region][cluster.ClusterIdentifier] = loggingStatus;
                }
            } catch (error) {
                LogUtil.error(error);
            }
        }
        return { audit_logs };
    }
}