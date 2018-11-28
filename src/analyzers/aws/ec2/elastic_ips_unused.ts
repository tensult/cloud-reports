import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class ElasticIPsUsageAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allElasticIPs = params.elastic_ips;
        if (!allElasticIPs) {
            return undefined;
        }
        const elastic_ips_unused: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        elastic_ips_unused.what = "Are there any elastic IPs unused?";
        elastic_ips_unused.why = "Elastic IPs are not free so we shouldn't keep unused IPs";
        elastic_ips_unused.recommendation = "Recommended delete unused elastic IPs";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allElasticIPs) {
            const regionElasticIPs = allElasticIPs[region];
            allRegionsAnalysis[region] = [];
            for (const elasticIp of regionElasticIPs) {
                const elasticIPAnalysis: IResourceAnalysisResult = {};
                elasticIPAnalysis.resource = elasticIp;
                elasticIPAnalysis.resourceSummary = {
                    name: "ElasticIP",
                    value: `${ResourceUtil.getNameByTags(elasticIp)} | ${elasticIp.PublicIp}`,
                };
                if (elasticIp.AssociationId || elasticIp.InstanceId) {
                    elasticIPAnalysis.severity = SeverityStatus.Good;
                    elasticIPAnalysis.message = "ElasticIP is used";
                } else {
                    elasticIPAnalysis.severity = SeverityStatus.Failure;
                    elasticIPAnalysis.message = "ElasticIP is not used";
                    elasticIPAnalysis.action = "Delete the ElasticIP";
                }
                allRegionsAnalysis[region].push(elasticIPAnalysis);
            }
        }
        elastic_ips_unused.regions = allRegionsAnalysis;
        return { elastic_ips_unused };
    }
}
