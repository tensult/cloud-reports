import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ZoneAwarenessAnalyzer extends BaseAnalyzer {
    public analyze(params: any, fullReport?: any): any {
        const allDomains = params.domains;
        if (!allDomains) {
            return undefined;
        }
        const zone_awareness_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        zone_awareness_enabled.what = "Is zone awareness enabled in Elasticsearch?";
        zone_awareness_enabled.why = `Enabling ES Zone Awareness promotes fault tolerance by distributing your 
        Elasticsearch data nodes across two Availability Zones available in the same AWS region.`;
        zone_awareness_enabled.recommendation = "Recommended to enable ZoneAwareness.";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allDomains) {
            const regionDomains = allDomains[region];
            allRegionsAnalysis[region] = [];
            for (const cluster of regionDomains) {
                const cluster_config_Analysis: IResourceAnalysisResult = {};
                cluster_config_Analysis.resource = cluster;
                const zoneEnability = cluster.ElasticsearchClusterConfig.ZoneAwarenessEnabled;
                const DomainName = cluster.DomainName;
                cluster_config_Analysis.resourceSummary = {
                    name: "Domain",
                    value: DomainName,
                };
                console.log(zoneEnability)
                if (zoneEnability == false) {
                    cluster_config_Analysis.severity = SeverityStatus.Failure;
                    cluster_config_Analysis.message = "ZoneAwareness not enabled.";
                    cluster_config_Analysis.action = 'Enable ZoneAwareness to increase the availability of your ES clusters.';
                } else {
                    cluster_config_Analysis.severity = SeverityStatus.Good;
                    cluster_config_Analysis.message = "ZoneAwareness is enabled.";
                }
                allRegionsAnalysis[region].push(cluster_config_Analysis);
            }
        }
        zone_awareness_enabled.regions = allRegionsAnalysis;
        return { zone_awareness_enabled };
    }
}
