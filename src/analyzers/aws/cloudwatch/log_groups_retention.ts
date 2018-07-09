import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, SeverityStatus, CheckAnalysisType, Dictionary } from '../../../types';

export class LogGroupsRetentionAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allLogGroups: any[] = params.log_groups;
        if (!allLogGroups) {
            return undefined;
        }
        const log_groups_retention: CheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        log_groups_retention.what = "Is retention set for CloudWatch log groups?";
        log_groups_retention.why = "It is important to set proper retention for CloudWatch log groups as it is very costly to keep these logs forever"
        log_groups_retention.recommendation = "Recommended to set retention for all the CloudWatch log groups";
        const allRegionsAnalysis : Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allLogGroups) {
            let regionLogGroups = allLogGroups[region];
            allRegionsAnalysis[region] = [];
            for (let logGroup of regionLogGroups) {
                let logGroupAnalysis: ResourceAnalysisResult = {};
                logGroupAnalysis.resource = logGroup;
                logGroupAnalysis.resourceSummary = {
                    name: 'LogGroup',
                    value: logGroup.logGroupName
                }
                if (logGroup.retentionInDays) {
                    logGroupAnalysis.severity = SeverityStatus.Good;
                    logGroupAnalysis.message = `Retention is set to ${logGroup.retentionInDays} days`;
                } else {
                    logGroupAnalysis.severity = SeverityStatus.Failure;
                    logGroupAnalysis.message = 'Retention is not set';
                    logGroupAnalysis.action = 'Set proper Retention';                    
                }
                allRegionsAnalysis[region].push(logGroupAnalysis);
            }
        }
        log_groups_retention.regions = allRegionsAnalysis;
        return { log_groups_retention };
    }
}