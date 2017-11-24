import { BaseAnalyzer } from '../../../base'
import { ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisResult } from '../../../../types';

export class AuditLogsAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allAuditLogs = params.audit_logs;
        if (!allAuditLogs) {
            return undefined;
        }
        const audit_logs: CheckAnalysisResult = {};
        audit_logs.what = "Are audit logs enabled for Redshift clusters?";
        audit_logs.why = "Audit logs contains information about connection requests and queries"
        audit_logs.recommendation = "Recommended to enable AuditLogs for all Redshift clusters";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allAuditLogs) {
            let regionAuditLogs = allAuditLogs[region];
            allRegionsAnalysis[region] = [];
            for (let clusterIdentifier in regionAuditLogs) {
                let audit_log_analysis: ResourceAnalysisResult = {};
                let auditLog = regionAuditLogs[clusterIdentifier]
                audit_log_analysis.resource = { clusterIdentifier, auditLog };
                audit_log_analysis.resourceSummary = {
                    name: 'Cluster', value: clusterIdentifier
                };
                if (auditLog && auditLog.LoggingEnabled) {
                    audit_log_analysis.severity = SeverityStatus.Good;
                    audit_log_analysis.message = 'Audit log is enabled';
                } else {
                    audit_log_analysis.severity = SeverityStatus.Failure;
                    audit_log_analysis.message = 'Audit log is not enabled';
                    audit_log_analysis.action = 'Enable audit log for cluster'
                }
                allRegionsAnalysis[region].push(audit_log_analysis);
            }
        }
        audit_logs.regions = allRegionsAnalysis;
        return { audit_logs };
    }
}