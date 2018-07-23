import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class DistributionLogsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allDistributionConfigs: any[] = params.distribution_configs;

        if (!allDistributionConfigs) {
            return undefined;
        }
        const distributions_logs_enabled: CheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        distributions_logs_enabled.what = "Are access logs enabled for CloudFront distributions?";
        distributions_logs_enabled.why = "It is important to enabled access logs for the distributions to understand access patterns and come with better caching strategies"
        distributions_logs_enabled.recommendation = "Recommended to enable access logs for all distributions";
        const allDistributionsAnalysis: ResourceAnalysisResult[] = [];
        for (let distributionId in allDistributionConfigs) {
            const distribution = allDistributionConfigs[distributionId];
            let distributionsAnalysis: ResourceAnalysisResult = {};

            distributionsAnalysis.resource = { distributionId, logging: distribution.Logging }
            let distributionAlias = this.getAliasName(distribution);
            distributionsAnalysis.resourceSummary = {
                name: 'DistributionId',
                value: distributionAlias ? `${distributionAlias} | ${distributionId}` : distributionId
            }
            if (distribution.Logging.Enabled) {
                distributionsAnalysis.severity = SeverityStatus.Good;
                distributionsAnalysis.message = 'Access Logs are enabled';
            } else {
                distributionsAnalysis.severity = SeverityStatus.Warning;
                distributionsAnalysis.message = 'Access Logs are not enabled';
                distributionsAnalysis.action = 'Enable Access Logs';
            }
            allDistributionsAnalysis.push(distributionsAnalysis);
        }
        distributions_logs_enabled.regions = { global: allDistributionsAnalysis };
        return { distributions_logs_enabled };
    }

    private getAliasName(distribution) {
        if(!distribution || !distribution.Aliases) {
            return undefined;
        }
        return distribution.Aliases.Items[0];
    }
}