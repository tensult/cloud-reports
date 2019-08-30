import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EMRClustersCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusters();
    }
    private async getAllClusters() {
        const self = this;
        const serviceName = "EMR";
        const emrRegion = self.getRegions(serviceName);
        const clusters = {};
        for (const region of emrRegion) {
            try {
                const emr = self.getClient(serviceName, region) as AWS.EMR;
                clusters[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const clusterList: AWS.EMR.Types.ListClustersOutput = await emr.listClusters
                        ({ ClusterStates: ["STARTING", "RUNNING"] }).promise();
                    clusters[region] = clusters[region].concat(clusterList.Clusters);
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { clusters };
    }
}