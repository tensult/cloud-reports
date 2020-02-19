import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class RDSClustersCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllClusters();
  }

  private async getAllClusters() {
    const self = this;

    const serviceName = "RDS";
    const rdsRegions = self.getRegions(serviceName);
    const clusters = {};

    for (const region of rdsRegions) {
      try {
        const rds = self.getClient(serviceName, region) as AWS.RDS;
        clusters[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const clustersResponse: AWS.RDS.DBClusterMessage = await rds
            .describeDBClusters({ Marker: marker })
            .promise();
          clusters[region] = clusters[region].concat(
            clustersResponse.DBClusters
          );
          marker = clustersResponse.Marker;
          fetchPending = marker !== undefined;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { clusters };
  }
}
