import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';
import { ResourceUtil } from '../../../utils';

export class ElasticIPsUsageAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allElasticIPs = params.elastic_ips;
        if (!allElasticIPs) {
            return undefined;
        }
        const elastic_ips_unused: CheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        elastic_ips_unused.what = "Are there any elastic IPs unused?";
        elastic_ips_unused.why = "Elastic IPs are not free so we shouldn't keep unused IPs"
        elastic_ips_unused.recommendation = "Recommended delete unused elastic IPs";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allElasticIPs) {
            let regionElasticIPs = allElasticIPs[region];
            allRegionsAnalysis[region] = [];
            for (let elasticIp of regionElasticIPs) {
                const elasticIPAnalysis: ResourceAnalysisResult = {};
                elasticIPAnalysis.resource = elasticIp;
                elasticIPAnalysis.resourceSummary = {
                    name: "ElasticIP",
                    value: `${ResourceUtil.getNameByTags(elasticIp)} | ${elasticIp.PublicIp}`
                }
                if (elasticIp.AssociationId || elasticIp.InstanceId) {
                    elasticIPAnalysis.severity = SeverityStatus.Good;
                    elasticIPAnalysis.message = 'ElasticIP is used';
                } else {
                    elasticIPAnalysis.severity = SeverityStatus.Failure;
                    elasticIPAnalysis.message = 'ElasticIP is not used';
                    elasticIPAnalysis.action = 'Delete the ElasticIP';
                }
                allRegionsAnalysis[region].push(elasticIPAnalysis);
            }
        }
        elastic_ips_unused.regions = allRegionsAnalysis;
        return { elastic_ips_unused };
    }
}