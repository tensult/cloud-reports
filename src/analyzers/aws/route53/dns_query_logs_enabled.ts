import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DnsQueryLogsConfigAnalyzer extends BaseAnalyzer {

    public analyze(params: any): any {
        const allHostZoneQueryLogsConfig = params.query_logs_config;
        const allHostedZones = params.hosted_zones;
        if (!allHostZoneQueryLogsConfig || !allHostedZones) {
            return undefined;
        }
        const dns_query_logs_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        dns_query_logs_enabled.what = "Is the DNS Query Logs enabled for Hosted Zones?";
        dns_query_logs_enabled.why = `DNS query logs provides insights into who and how is
         the domain getting accessed and this helps to enable proper security controls`;
        dns_query_logs_enabled.recommendation = "It is recommended to enable query logs for all hosted zones.";
        const allHostZonesAnalysis: IResourceAnalysisResult[] = [];
        const allHostZoneQueryLogsConfigMapByHostedZoneId = this.getHostZoneQueryLogsConfigMapByHostedZoneId(
            allHostZoneQueryLogsConfig);
        for (const hostedZone of allHostedZones) {
            const hosted_analysis: IResourceAnalysisResult = {};
            const hostedSimpleZoneId = hostedZone.Id.replace("/hostedzone/", "");
            hosted_analysis.resource = {
                hostedZone,
                query_log_config: allHostZoneQueryLogsConfigMapByHostedZoneId[hostedSimpleZoneId],
            };
            hosted_analysis.resourceSummary = {
                name: "HostedZone", value: hostedZone.Name,
            };
            if (allHostZoneQueryLogsConfigMapByHostedZoneId[hostedSimpleZoneId]) {
                hosted_analysis.severity = SeverityStatus.Good;
                hosted_analysis.message = "Query logs are already enabled";
            } else {
                hosted_analysis.severity = SeverityStatus.Failure;
                hosted_analysis.message = "Query logs are not enabled";
                hosted_analysis.action = "Enable query logs for the hosted zone";
            }
            allHostZonesAnalysis.push(hosted_analysis);
        }
        dns_query_logs_enabled.regions = { global: allHostZonesAnalysis };
        return { dns_query_logs_enabled };
    }

    private getHostZoneQueryLogsConfigMapByHostedZoneId(allHostZoneQueryLogsConfig: any[]) {
        return allHostZoneQueryLogsConfig.reduce((configMap, config) => {
            configMap[config.HostedZoneId] = config;
            return configMap;
        }, {});
    }
}
