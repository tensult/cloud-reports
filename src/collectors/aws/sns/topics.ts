import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class TopicsCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllTopics();
    }
    private async getAllTopics() {

        const serviceName = 'SNS';
        const snsRegions = this.getRegions(serviceName);
        const topics = {};

        for (let region of snsRegions) {
            let sns = this.getClient(serviceName, region) as AWS.SNS;
            topics[region] = [];
            let fetchPending = true;
            let marker: string | undefined = undefined;
            while (fetchPending) {
                const topicsResponse: AWS.SNS.ListTopicsResponse = await sns.listTopics({ NextToken: marker }).promise();
                if (topicsResponse.Topics) {
                    topics[region] = topics[region].concat(topicsResponse.Topics);
                }
                marker = topicsResponse.NextToken;
                fetchPending = marker !== undefined;
            }
        }
        return { topics };
    }

}

