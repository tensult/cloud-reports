import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { LambdaFunctionsCollector } from "./functions";

export class LambdaFunctionVersionsCollector extends BaseCollector {
    public collect() {
        return this.getAllFunctionVersions();
    }

    private async getAllFunctionVersions() {

        const self = this;
        const serviceName = "Lambda";
        const lambdaRegions = self.getRegions(serviceName);
        const lambdaFunctionsCollector = new LambdaFunctionsCollector();
        lambdaFunctionsCollector.setSession(this.getSession());
        const function_versions = {};
        try {
            const functionsData = await CollectorUtil.cachedCollect(lambdaFunctionsCollector);
            const functions = functionsData.functions;
            for (const region of lambdaRegions) {
                function_versions[region] = {};
                try {
                    const lambda = self.getClient(serviceName, region) as AWS.Lambda;
                    for (const fn of functions[region]) {
                        const functionVersionsResponse:
                            AWS.Lambda.ListVersionsByFunctionResponse =
                            await lambda.listVersionsByFunction
                                ({ FunctionName: fn.FunctionName, MaxItems: 7 }).promise();
                        function_versions[region][fn.FunctionName] = functionVersionsResponse.Versions;
                        await CommonUtil.wait(1000);
                    }
                } catch (error) {
                    AWSErrorHandler.handle(error);
                    continue;
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { function_versions };
    }
}
