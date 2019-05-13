import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class ClusterEncryptionAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allClusterEncryption = params.clusters;
        if (!allClusterEncryption) {
            return undefined;
        }
        const clusters: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        clusters.what = "Are audit logs enabled for RedShift clusters?";
        clusters.why = "Audit logs contains information about connection requests and queries";
        clusters.recommendation = "Recommended to enable ClusterEncryption for all RedShift clusters";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allClusterEncryption) {
            const regionClusterEncryption = allClusterEncryption[region];
            allRegionsAnalysis[region] = [];
            for (const clusterIdentifier in regionClusterEncryption) {
                const clusters_analysis: IResourceAnalysisResult = {};
                const clusterEncrypt = regionClusterEncryption[clusterIdentifier];
                clusters_analysis.resource = { clusterIdentifier, clusterEncrypt };
                clusters_analysis.resourceSummary = {
                    name: "Cluster", value: clusterIdentifier,
                };
                if (clusterEncrypt && clusterEncrypt.EncryptionEnabled) {
                    clusters_analysis.severity = SeverityStatus.Good;
                    clusters_analysis.message = "Cluster encryption is enabled";
                } else {
                    clusters_analysis.severity = SeverityStatus.Failure;
                    clusters_analysis.message = "Cluster encryption is not enabled";
                    clusters_analysis.action = "Enable Cluster encryption for security";
                }
                allRegionsAnalysis[region].push(clusters_analysis);
            }
        }
        clusters.regions = allRegionsAnalysis;
        return { clusters };
    }
}

