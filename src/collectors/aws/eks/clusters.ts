import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class EksClusterListCollector extends BaseCollector {

    public async collect() {
        return this.getAllClusters();
    }

    private async getAllClusters() {
        const self = this;
        const serviceName = "EKS";
        const eksRegions = self.getRegions(serviceName);
        const clusters = {};
        for (const region of eksRegions) {
            try {
                const eks = self.getClient(serviceName, region) as AWS.EKS;
                clusters[region] = [];
                let fetchPending = true;
                let nextToken: string | undefined;
                while (fetchPending) {
                    const clusterListResponse: any = await eks.listClusters
                        ({ nextToken }).promise();
                    for (let i = 0; i < clusterListResponse.clusters.length; i++) {
                        const clusterDescribeResponse: AWS.EKS.Types.DescribeClusterResponse =
                            await eks.describeCluster({
                                name: clusterListResponse.clusters[i],
                            }).promise();
                        clusterListResponse.clusters[i] = clusterDescribeResponse.cluster;
                    }
                    clusters[region] =
                        clusters[region].concat(clusterListResponse.clusters);
                    nextToken = clusterListResponse.nextToken;
                    fetchPending = nextToken !== undefined && nextToken !== null;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { clusters };
    }
}
