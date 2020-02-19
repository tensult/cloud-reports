import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class RedshiftClustersCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllClusters();
  }

  private async getAllClusters() {
    const self = this;

    const serviceName = "Redshift";
    const redshiftRegions = self.getRegions(serviceName);
    const clusters = {};

    for (const region of redshiftRegions) {
      try {
        const redshift = self.getClient(serviceName, region) as AWS.Redshift;
        clusters[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const clustersResponse: AWS.Redshift.Types.ClustersMessage = await redshift
            .describeClusters({ Marker: marker })
            .promise();
          clusters[region] = clusters[region].concat(clustersResponse.Clusters);
          marker = clustersResponse.Marker;
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
