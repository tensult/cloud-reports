import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class ApisCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect(callback: (err?: Error, data?: any) => void) {
    return this.getAllApis();
  }

  private async getAllApis() {
    const serviceName = "APIGateway";
    const apiGatewayRegions = this.getRegions(serviceName);
    const apis = {};

    for (const region of apiGatewayRegions) {
      try {
        const apiGateway = this.getClient(
          serviceName,
          region
        ) as AWS.APIGateway;
        apis[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const apisResponse: AWS.APIGateway.RestApis = await apiGateway
            .getRestApis({ position: marker })
            .promise();
          if (apisResponse.items) {
            apis[region] = apis[region].concat(apisResponse.items);
          }
          marker = apisResponse.position;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        }
      } catch (error) {
        AWSErrorHandler.handle(error);
        continue;
      }
    }
    return { apis };
  }
}
