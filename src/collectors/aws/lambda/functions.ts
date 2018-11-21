import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class LambdaFunctionsCollector extends BaseCollector {
    collect() {
        return this.getAllFunctions();
    }

    private async getAllFunctions() {

        const self = this;

        const serviceName = 'Lambda';
        const lambdaRegions = self.getRegions(serviceName);
        const functions = {};

        for (let region of lambdaRegions) {
            try{
                let lambda = self.getClient(serviceName, region) as AWS.Lambda;
                functions[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const functionsResponse: AWS.Lambda.ListFunctionsResponse = await lambda.listFunctions({ Marker: marker }).promise();
                    functions[region] = functions[region].concat(functionsResponse.Functions);
                    marker = functionsResponse.NextMarker;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch(error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { functions };
    }
}