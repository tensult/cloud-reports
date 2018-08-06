import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class ApisCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllApis();
    }

    private async getAllApis() {

        const serviceName = 'APIGateway';
        const apiGatewayRegions = this.getRegions(serviceName);
        const apis = {};

        for (let region of apiGatewayRegions) {
            try {
                let apiGateway = this.getClient(serviceName, region) as AWS.APIGateway;
                apis[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const apisResponse: AWS.APIGateway.RestApis = await apiGateway.getRestApis({ position: marker }).promise();
                    if (apisResponse.items) {
                        apis[region] = apis[region].concat(apisResponse.items);
                    }
                    marker = apisResponse.position;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch(error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { apis };
    }
}