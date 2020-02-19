import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class ResourceGroupsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllResourceGroups();
  }

  private async getAllResourceGroups() {
    const self = this;

    const serviceName = "ResourceGroups";
    const resourceGroupsRegions = self.getRegions(serviceName);
    const resource_groups = {};

    for (const region of resourceGroupsRegions) {
      try {
        const resourceGroups = self.getClient(
          serviceName,
          region
        ) as AWS.ResourceGroups;
        resource_groups[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const resourceGroupsResponse: AWS.ResourceGroups.Types.ListGroupsOutput = await resourceGroups
            .listGroups({ NextToken: marker })
            .promise();
          if (resourceGroupsResponse.Groups) {
            resource_groups[region] = resource_groups[region].concat(
              resourceGroupsResponse.Groups
            );
          }
          marker = resourceGroupsResponse.NextToken;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
      }
    }
    return { resource_groups };
  }
}
