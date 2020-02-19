import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { LambdaFunctionsCollector } from "./functions";

import { IDictionary } from "../../../types";

export class LambdaFunctionAliasesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllFunctionAliases();
  }

  private async getAllFunctionAliases() {
    const self = this;
    const serviceName = "Lambda";
    const lambdaRegions = self.getRegions(serviceName);
    const lambdaFunctionsCollector = new LambdaFunctionsCollector();
    lambdaFunctionsCollector.setSession(this.getSession());
    const function_aliases = {};
    try {
      const functionsData = await CollectorUtil.cachedCollect(
        lambdaFunctionsCollector
      );
      const functions = functionsData.functions;
      for (const region of lambdaRegions) {
        function_aliases[region] = {};
        this.context[region] = region;

        try {
          const lambda = self.getClient(serviceName, region) as AWS.Lambda;
          for (const fn of functions[region]) {
            const functionAliasesResponse: AWS.Lambda.ListAliasesResponse = await lambda
              .listAliases({ FunctionName: fn.FunctionName, MaxItems: 5 })
              .promise();
            if (functionAliasesResponse.Aliases) {
              function_aliases[region][fn.FunctionName] =
                functionAliasesResponse.Aliases;
            } else {
              function_aliases[region][fn.FunctionName] = [];
            }
            await CommonUtil.wait(200);
          }
        } catch (error) {
          AWSErrorHandler.handle(error);
          continue;
        }
      }
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
    return { function_aliases };
  }
}
