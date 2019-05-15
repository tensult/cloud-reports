import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class AuditLogsAnalyzer extends BaseAnalyzer {
    public  checks_what : string = "Are audit logs enabled for RedShift clusters?";
    public  checks_why : string = "Audit logs contains information about connection requests and queries";
    public checks_recommendation : string = "Recommended to enable AuditLogs for all RedShift clusters";
    public checks_name : string = "Cluster";
    public analyze(params: any, fullReport?: any): any {
        const allAuditLogs = params.audit_logs;
        if (!allAuditLogs) {
            return undefined;
        }
        const audit_logs: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        audit_logs.what = this.checks_what;
        audit_logs.why = this.checks_why;
        audit_logs.recommendation = this.checks_recommendation;
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allAuditLogs) {
            const regionAuditLogs = allAuditLogs[region];
            allRegionsAnalysis[region] = [];
            for (const clusterIdentifier in regionAuditLogs) {
                const audit_log_analysis: IResourceAnalysisResult = {};
                const auditLog = regionAuditLogs[clusterIdentifier];
                audit_log_analysis.resource = { clusterIdentifier, auditLog };
                audit_log_analysis.resourceSummary = {
                    name: this.checks_name, value: clusterIdentifier,
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
