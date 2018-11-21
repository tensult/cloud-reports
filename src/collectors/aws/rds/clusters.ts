import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class RDSClustersCollector extends BaseCollector {
    collect() {
        return this.getAllClusters();
    }

    private async getAllClusters() {

        const self = this;

        const serviceName = 'RDS';
        const rdsRegions = self.getRegions(serviceName);
        const clusters = {};

        for (let region of rdsRegions) {
            try {
                let rds = self.getClient(serviceName, region) as AWS.RDS;
                clusters[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const clustersResponse: AWS.RDS.DBClusterMessage = await rds.describeDBClusters({ Marker: marker }).promise();
                    clusters[region] = clusters[region].concat(clustersResponse.DBClusters);
                    marker = clustersResponse.Marker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { clusters };
    }
}