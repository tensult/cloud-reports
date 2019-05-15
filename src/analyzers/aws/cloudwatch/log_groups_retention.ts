import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class LogGroupsRetentionAnalyzer extends BaseAnalyzer {
    public checks_what : string = "Is retention set for CloudWatch log groups?";
    public checks_why : string = `It is important to set proper retention for CloudWatch log
    groups as it is very costly to keep these logs forever`;
    public  checks_recommendation: string = "Recommended to set retention for all the CloudWatch log groups" ;
    public  checks_name: string = "LogGroup";
    public analyze(params: any, fullReport?: any): any {
        const allLogGroups: any[] = params.log_groups;
        if (!allLogGroups) {
            return undefined;
        }
        const log_groups_retention: ICheckAnalysisResult = { type: CheckAnalysisType.CostOptimization };
        log_groups_retention.what = this.checks_what;
        log_groups_retention.why = this.checks_why;
        log_groups_retention.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allLogGroups) {
            const regionLogGroups = allLogGroups[region];
            allRegionsAnalysis[region] = [];
            for (const logGroup of regionLogGroups) {
                const logGroupAnalysis: IResourceAnalysisResult = {};
                logGroupAnalysis.resource = logGroup;
                logGroupAnalysis.resourceSummary = {
                    name: this.checks_name,
                    value: logGroup.logGroupName,
                };
                if (logGroup.retentionInDays) {
                    logGroupAnalysis.severity = SeverityStatus.Good;
                    logGroupAnalysis.message = `Retention is set to ${logGroup.retentionInDays} days`;
                } else {
                    logGroupAnalysis.severity = SeverityStatus.Warning;
                    logGroupAnalysis.message = "Retention is not set";
                    logGroupAnalysis.action = "Set proper Retention";
                }
                allRegionsAnalysis[region].push(logGroupAnalysis);
            }
        }
        log_groups_retention.regions = allRegionsAnalysis;
        return { log_groups_retention };
    }
}
