import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ESVersionsCollector extends BaseCollector {
    public collect() {
        return this.getAllVersions();
    }

    private async getAllVersions() {

        const serviceName = "ES";
        const esRegions = this.getRegions(serviceName);
        const versions = {};

        for (const region of esRegions) {
            try {
                const es = this.getClient(serviceName, region) as AWS.ES;
                let fetchPending = true;
                let token: string | undefined;

                while ( fetchPending ) {
                    const versionsResponse: AWS.ES.ListElasticsearchVersionsResponse = await es.listElasticsearchVersions({ NextToken : token }).promise();
                    if (versionsResponse && versionsResponse.ElasticsearchVersions) {
                        versions[region] = versionsResponse.ElasticsearchVersions.map((versions) => {
                            return versions;
                        });
                        await CommonUtil.wait(200);
                        token = versionsResponse.NextToken;
                        fetchPending = token !== undefined && token!== null;
                    }

                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { versions };
    }
}
