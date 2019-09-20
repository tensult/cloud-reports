import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { ESVersionsCollector } from "./versions";

export class ESInstanceTypesCollector extends BaseCollector {
    public collect() {
        return this.getAllInstanceTypes();
    }

    private async getAllInstanceTypes() {
        const serviceName = "ES";
        const esRegions = this.getRegions(serviceName);
        const esVersionsCollector = new ESVersionsCollector();
        esVersionsCollector.setSession(this.getSession());
        const instance_types = {};
        try {
            const versionsData = await CollectorUtil.cachedCollect(esVersionsCollector);
            const version = versionsData.versions;
            for (const region of esRegions) {
                if (!version[region]) {
                    continue;
                }
                const instVersion = version[region];

                for (const versionNum of instVersion) {
                    try {
                        const es = this.getClient(serviceName, region) as AWS.ES;
                        const instanceType: AWS.ES.ListElasticsearchInstanceTypesResponse =
                            await es.listElasticsearchInstanceTypes({ ElasticsearchVersion: versionNum }).promise();
                        if (instanceType && instanceType.ElasticsearchInstanceTypes) {
                            instance_types[region] = instanceType.ElasticsearchInstanceTypes;
                        }
                        await CommonUtil.wait(200);
                    } catch (error) {
                        AWSErrorHandler.handle(error);
                        continue;
                    }
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { instance_types };
    }
}
