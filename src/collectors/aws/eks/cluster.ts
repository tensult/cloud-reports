import * as AWS from "aws-sdk";
import { CommonUtil, CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { EksClusterListCollector } from "./cluster_list";

export class EksClustersCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllCluster();
    }

    private async getAllCluster() {

        const self = this;
        const serviceName = "EKS";
        const eksRegions = self.getRegions(serviceName);
        const EksClusterListCollectorInstance = new EksClusterListCollector();
        EksClusterListCollectorInstance.setSession(self.getSession());
        const cluster = {};

        try {
            const clusterNameData = await CollectorUtil.cachedCollect(EksClusterListCollectorInstance);
            const clusterNames = clusterNameData.cluster_list;
            for (const region of eksRegions) {
                if (!clusterNames[region]) {
                    continue;
                }
                const clusterName = clusterNames[region];
                for (const clustername of clusterName) {
                    try {
                        const eks = self.getClient(serviceName, region) as AWS.EKS;
                        cluster[region] = [];
                        let fetchPending = true;
                        let token: string | undefined;
                        while (fetchPending) {
                            const clusterResponse:
                                AWS.EKS.Types.DescribeClusterResponse = await eks.describeCluster
                                    ({name:clustername}).promise();
                            cluster[region] = cluster[region].concat(clusterResponse.cluster);
                            fetchPending = token !== undefined;
                            await CommonUtil.wait(200);
                        }

                    } catch (error) {
                        AWSErrorHandler.handle(error);
                    }
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { cluster };
    }
}