import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { AWSErrorHandler } from '../../../utils/aws';

export class DistributionsCollector extends BaseCollector {
    collect() {
        return this.listAllDistributions();
    }

    private async listAllDistributions() {
        try {
            const cloudfront = this.getClient('CloudFront', 'us-east-1') as AWS.CloudFront;
            let fetchPending = true;
            let marker: string | undefined = undefined;
            let distributions: AWS.CloudFront.DistributionSummary[] = [];
            while (fetchPending) {
                let cloudfrontDistributionsData: AWS.CloudFront.ListDistributionsResult = await cloudfront.listDistributions({ Marker: marker }).promise();
                if(cloudfrontDistributionsData.DistributionList && cloudfrontDistributionsData.DistributionList.Items) {
                    distributions = distributions.concat(cloudfrontDistributionsData.DistributionList.Items);
                    marker = cloudfrontDistributionsData.DistributionList.NextMarker;
                    fetchPending = marker !== undefined && marker !== null;
                } else {
                    fetchPending = false;
                }
            }
            return { distributions };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}