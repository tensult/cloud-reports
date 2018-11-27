import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { RedshiftClustersCollector } from "."
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class RedshiftAuditLogsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAuditLogs();
    }

    private async getAuditLogs() {

        const self = this;

        const serviceName = 'Redshift';
        const redshiftRegions = self.getRegions(serviceName);
        const redshiftClustersCollector = new RedshiftClustersCollector();
        redshiftClustersCollector.setSession(self.getSession());
        const audit_logs = {};

        try {
            const clustersData = await CollectorUtil.cachedCollect(redshiftClustersCollector);

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
                    AWSErrorHandler.handle(error);
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { audit_logs };
    }
}