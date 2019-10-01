import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";


export class ECSClustersCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllClusters();
    }

    private async getAllClusters() {

        const self = this;
        const serviceName = "ECS";
        const ecsRegions = self.getRegions(serviceName);
        const clusterList = {};

        for (const region of ecsRegions) {
            try {
                const ecs = self.getClient(serviceName, region) as AWS.ECS;
                clusterList[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const clustersResponse:
                        AWS.ECS.Types.DescribeClustersResponse = await ecs.describeClusters
                            ({ clusters: ["default"] }).promise();
                    clusterList[region] = clusterList[region].concat(clustersResponse.clusters);
                    fetchPending = marker !== undefined;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { clusterList };
    }
}
