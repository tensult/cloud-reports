import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EksClusterListCollector extends BaseCollector {
    public async collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusters();
    }
    
    private async getAllClusters() {

        const self = this;
        const serviceName = "EKS";
        const eksRegions = self.getRegions(serviceName);
        const cluster_list = {};

        for (const region of eksRegions) {
            try {
                const eks = self.getClient(serviceName, region) as AWS.EKS;
                cluster_list[region] = [];
                let fetchPending = true;
                let nextToken : string | undefined;
                while (fetchPending) {
                    const clusterListResponse:
                        AWS.EKS.Types.ListClustersResponse = await eks.listClusters
                            ({ nextToken }).promise();
                        cluster_list[region] = cluster_list[region].concat(clusterListResponse.clusters);                        
                    fetchPending = nextToken !== undefined && nextToken !== null;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { cluster_list };
    }
}