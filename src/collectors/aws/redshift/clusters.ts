import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class RedshiftClustersCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusters();
    }

    private async getAllClusters() {

        const self = this;

        const serviceName = 'Redshift';
        const redshiftRegions = self.getRegions(serviceName);
        const clusters = {};

        for (let region of redshiftRegions) {
            try {
                let redshift = self.getClient(serviceName, region) as AWS.Redshift;
                clusters[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const clustersResponse: AWS.Redshift.Types.ClustersMessage = await redshift.describeClusters({ Marker: marker }).promise();
                    clusters[region] = clusters[region].concat(clustersResponse.Clusters);
                    marker = clustersResponse.Marker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
            }
        }
        return { clusters };
    }
}