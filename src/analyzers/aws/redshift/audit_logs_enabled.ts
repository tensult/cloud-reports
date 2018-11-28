import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AuditLogsAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allAuditLogs = params.audit_logs;
        if (!allAuditLogs) {
            return undefined;
        }
        const audit_logs: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        audit_logs.what = "Are audit logs enabled for RedShift clusters?";
        audit_logs.why = "Audit logs contains information about connection requests and queries";
        audit_logs.recommendation = "Recommended to enable AuditLogs for all RedShift clusters";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allAuditLogs) {
            const regionAuditLogs = allAuditLogs[region];
            allRegionsAnalysis[region] = [];
            for (const clusterIdentifier in regionAuditLogs) {
                const audit_log_analysis: IResourceAnalysisResult = {};
                const auditLog = regionAuditLogs[clusterIdentifier];
                audit_log_analysis.resource = { clusterIdentifier, auditLog };
                audit_log_analysis.resourceSummary = {
                    name: "Cluster", value: clusterIdentifier,
                };
                if (auditLog && auditLog.LoggingEnabled) {
                    audit_log_analysis.severity = SeverityStatus.Good;
                    audit_log_analysis.message = "Audit log is enabled";
                } else {
                    audit_log_analysis.severity = SeverityStatus.Failure;
                    audit_log_analysis.message = "Audit log is not enabled";
                    audit_log_analysis.action = "Enable audit log for cluster";
                }
                allRegionsAnalysis[region].push(audit_log_analysis);
            }
        }
        audit_logs.regions = allRegionsAnalysis;
        return { audit_logs };
    }
}
