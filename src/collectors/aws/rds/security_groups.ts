import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class RDSSecurityGroupsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllSecurityGroups();
  }

  private async getAllSecurityGroups() {
    const self = this;

    const serviceName = "RDS";
    const rdsRegions = self.getRegions(serviceName);
    const security_groups = {};

    for (const region of rdsRegions) {
      try {
        const rds = self.getClient(serviceName, region) as AWS.RDS;
        security_groups[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const securityGroupsResponse: AWS.RDS.DBSecurityGroupMessage = await rds
            .describeDBSecurityGroups({ Marker: marker })
            .promise();
          security_groups[region] = security_groups[region].concat(
            securityGroupsResponse.DBSecurityGroups
          );
          marker = securityGroupsResponse.Marker;
          fetchPending = marker !== undefined;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { security_groups };
  }
}
