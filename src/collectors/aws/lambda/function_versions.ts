import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';
import { CollectorUtil } from '../../../utils';
import { LambdaFunctionsCollector } from './functions';

export class LambdaFunctionVersionsCollector extends BaseCollector {
    collect() {
        return this.getAllFunctionVersions();
    }

    private async getAllFunctionVersions() {

        const self = this;
        const serviceName = 'Lambda';
        const lambdaRegions = self.getRegions(serviceName);
        const lambdaFunctionsCollector = new LambdaFunctionsCollector();
        lambdaFunctionsCollector.setSession(this.getSession());
        const functionsData = await CollectorUtil.cachedCollect(lambdaFunctionsCollector);
        const functions = functionsData.functions;
        const function_versions = {};
        for (let region of lambdaRegions) {
            function_versions[region] = {};
            try{
                let lambda = self.getClient(serviceName, region) as AWS.Lambda;
                for(let fn of functions[region]) {
                    const functionVersionsResponse: AWS.Lambda.ListVersionsByFunctionResponse = await lambda.listVersionsByFunction({ FunctionName: fn.FunctionName, MaxItems: 7 }).promise();
                    function_versions[region][fn.FunctionName] = functionVersionsResponse.Versions;
                }
            } catch(error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { function_versions };
    }
}