import * as AWS from "aws-sdk";
import { IDictionary } from "../../../types";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { ApisCollector } from "./apis";

export class ApiStagesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllApiStages();
  }

  private async getAllApiStages() {
    const self = this;
    const serviceName = "APIGateway";
    const apiGatewayRegions = self.getRegions(serviceName);
    const apisCollector = new ApisCollector();
    apisCollector.setSession(this.getSession());
    const api_stages = {};
    try {
      const apisData = await CollectorUtil.cachedCollect(apisCollector);
      const apis = apisData.apis;

      for (const region of apiGatewayRegions) {
        try {
          const apiGatewayService = self.getClient(
            serviceName,
            region
          ) as AWS.APIGateway;
          const regionApis = apis[region];
          this.context[region] = region;

          const regionApiStages: IDictionary<AWS.APIGateway.Stage[]> = {};
          for (const api of regionApis) {
            const apiStages: AWS.APIGateway.Types.Stages = await apiGatewayService
              .getStages({ restApiId: api.id })
              .promise();
            if (apiStages.item) {
              regionApiStages[api.id] = apiStages.item;
            }
            await CommonUtil.wait(200);
          }
          api_stages[region] = regionApiStages;
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { api_stages };
  }
}
