import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class DistributionsCollector extends BaseCollector {
    public collect() {
        return this.listAllDistributions();
    }

    private async listAllDistributions() {
        try {
            const cloudfront = this.getClient("CloudFront", "us-east-1") as AWS.CloudFront;
            let fetchPending = true;
            let marker: string | undefined;
            let distributions: AWS.CloudFront.DistributionSummary[] = [];
            while (fetchPending) {
                const cloudfrontDistributionsData: AWS.CloudFront.ListDistributionsResult = await cloudfront.listDistributions({ Marker: marker }).promise();
                if (cloudfrontDistributionsData.DistributionList && cloudfrontDistributionsData.DistributionList.Items) {
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
