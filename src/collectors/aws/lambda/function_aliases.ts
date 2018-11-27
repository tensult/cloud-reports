import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';
import { CollectorUtil } from '../../../utils';
import { LambdaFunctionsCollector } from './functions';

export class LambdaFunctionAliasesCollector extends BaseCollector {
    collect() {
        return this.getAllFunctionAliases();
    }

    private async getAllFunctionAliases() {

        const self = this;
        const serviceName = 'Lambda';
        const lambdaRegions = self.getRegions(serviceName);
        const lambdaFunctionsCollector = new LambdaFunctionsCollector();
        lambdaFunctionsCollector.setSession(this.getSession());
        const function_aliases = {};
        try {
            const functionsData = await CollectorUtil.cachedCollect(lambdaFunctionsCollector);
            const functions = functionsData.functions;
            for (let region of lambdaRegions) {
                function_aliases[region] = {};
                try {
                    let lambda = self.getClient(serviceName, region) as AWS.Lambda;
                    for (let fn of functions[region]) {
                        const functionAliasesResponse: AWS.Lambda.ListAliasesResponse = await lambda.listAliases({ FunctionName: fn.FunctionName }).promise();
                        if (functionAliasesResponse.Aliases) {
                            function_aliases[region][fn.FunctionName] = functionAliasesResponse.Aliases;
                        } else {
                            function_aliases[region][fn.FunctionName] = [];
                        }
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