import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class QueueUrlsCollector extends BaseCollector {
    collect() {
        return this.getAllQueues();
    }
    private async getAllQueues() {

        const serviceName = 'SQS';
        const sqsRegions = this.getRegions(serviceName);
        const queue_urls = {};

        for (let region of sqsRegions) {
            try {
                let sqs = this.getClient(serviceName, region) as AWS.SQS;
                queue_urls[region] = [];
                const queueUrlsResponse: AWS.SQS.ListQueuesResult = await sqs.listQueues().promise();
                if (queueUrlsResponse.QueueUrls && queueUrlsResponse.QueueUrls.length) {
                    queue_urls[region] = queueUrlsResponse.QueueUrls;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { queue_urls };
    }

}

