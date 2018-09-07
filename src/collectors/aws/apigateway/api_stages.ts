import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { ApisCollector } from "./apis"
import { CollectorUtil } from "../../../utils";
import { Dictionary } from '../../../types';
import { LogUtil } from '../../../utils/log';

export class ApiStagesCollector extends BaseCollector {
    collect() {
        return this.getAllApiStages();
    }

    private async getAllApiStages() {
        const self = this;
        const serviceName = 'APIGateway';
        const apiGatewayRegions = self.getRegions(serviceName);
        const apisCollector = new ApisCollector();
        apisCollector.setSession(this.getSession());
        const apisData = await CollectorUtil.cachedCollect(apisCollector);
        const apis = apisData.apis;
        const api_stages = {};

        for (let region of apiGatewayRegions) {
            try {
                let apiGatewayService = self.getClient(serviceName, region) as AWS.APIGateway;
                let regionApis = apis[region];
                let regionApiStages: Dictionary<AWS.APIGateway.Stage[]> = {};
                for (let api of regionApis) {
                    let apiStages: AWS.APIGateway.Types.Stages = await apiGatewayService.getStages({ restApiId: api.id }).promise();
                    if (apiStages.item) {
                        regionApiStages[api.id] = apiStages.item;
                    }
                }
                api_stages[region] = regionApiStages;
            } catch(error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { api_stages };
    }
}