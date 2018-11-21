import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class ESReservedInstancesCollector extends BaseCollector {
    collect() {
        return this.getAllInstances();
    }

    private async getAllInstances() {

        const serviceName = 'ES';
        const esRegions = this.getRegions(serviceName);
        const reserved_instances = {};

        for (let region of esRegions) {
            try {
                let es = this.getClient(serviceName, region) as AWS.ES;
                reserved_instances[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const instancesResponse: AWS.ES.DescribeReservedElasticsearchInstancesResponse = await es.describeReservedElasticsearchInstances({ NextToken: marker }).promise();
                    if (instancesResponse && instancesResponse.ReservedElasticsearchInstances) {
                        reserved_instances[region] = reserved_instances[region].concat(instancesResponse.ReservedElasticsearchInstances);
                        marker = instancesResponse.NextToken;
                        fetchPending = marker !== undefined && marker !== null;
                    } else {
                        fetchPending = false;
                    }
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { reserved_instances };
    }
}