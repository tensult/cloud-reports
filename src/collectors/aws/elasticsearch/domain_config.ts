import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { ESDomainNamesCollector } from "./domain_names";

export class ESDomainConfigCollector extends BaseCollector {
    public collect() {
        return this.getAllDomainConfigs();
    }

    private async getAllDomainConfigs() {

        const serviceName = "ES";
        const esRegions = this.getRegions(serviceName);
        const esDomainNamesCollector = new ESDomainNamesCollector();
        esDomainNamesCollector.setSession(this.getSession());
        const domain_config = {};

        try {
            const domainNamesData = await CollectorUtil.cachedCollect(esDomainNamesCollector);
            const domainNames = domainNamesData.domain_names;            

            for (const region of esRegions) {
                if (!domainNames[region]) {
                    continue;
                }
                const dname=domainNames[region];
                for(const name of dname){
                    try {
                        const es = this.getClient(serviceName, region) as AWS.ES;
                        const domainConfigResponse: AWS.ES.DescribeElasticsearchDomainConfigResponse =
                            await es.describeElasticsearchDomainConfig({ DomainName: name }).promise();
                            
                        if (domainConfigResponse && domainConfigResponse.DomainConfig) {
                            domain_config[region] = domainConfigResponse.DomainConfig;
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
        return { domain_config };
    }
}
