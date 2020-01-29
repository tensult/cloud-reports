import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DynamoDBTablesBackupEnabledAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allTablesBackupStatuses = params.tables_backup;
        if (!allTablesBackupStatuses) {
            return undefined;
        }
        const tables_backup_enabled: ICheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        tables_backup_enabled.what = "Are there any DynamoDB table without backup enabled?";
        tables_backup_enabled.why = `DynamoDB can be accidentally deleted and
        data can be lost when tables are without backup enabled`;
        tables_backup_enabled.recommendation = "Recommended to enable backup for all production critical tables";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTablesBackupStatuses) {
            const regionTablesBackupStatuses = allTablesBackupStatuses[region];
            allRegionsAnalysis[region] = [];
            for (const tableName in regionTablesBackupStatuses) {
                const tableBackupStatus = regionTablesBackupStatuses[tableName];
                const tableBackupEnableStatusAnalysis: IResourceAnalysisResult = {};
                tableBackupEnableStatusAnalysis.resource = {
                    tableBackupStatus: tableBackupStatus.ContinuousBackupsStatus, tableName,
                };
                tableBackupEnableStatusAnalysis.resourceSummary = {
                    name: "Table",
                    value: tableName,
                };
                if (tableBackupStatus.ContinuousBackupsStatus === "ENABLED") {
                    tableBackupEnableStatusAnalysis.severity = SeverityStatus.Good;
                    tableBackupEnableStatusAnalysis.message = "Backup already enabled";
                } else {
                    tableBackupEnableStatusAnalysis.severity = SeverityStatus.Failure;
                    tableBackupEnableStatusAnalysis.message = "Not enabled";
                    tableBackupEnableStatusAnalysis.action = "Enable table backup";
                }
                allRegionsAnalysis[region].push(tableBackupEnableStatusAnalysis);

                const tablePointInTimeRecoveryStatusAnalysis: IResourceAnalysisResult = {};
                tablePointInTimeRecoveryStatusAnalysis.resource = {
                    tableName,
                    tablePointInTimeRecoveryStatus:
                        tableBackupStatus.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,
                };
                tablePointInTimeRecoveryStatusAnalysis.resourceSummary = {
                    name: "Table",
                    value: tableName,
                };
                if (tableBackupStatus.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus === "ENABLED") {
                    tablePointInTimeRecoveryStatusAnalysis.severity = SeverityStatus.Good;
                    tablePointInTimeRecoveryStatusAnalysis.message = "PointInTimeRecovery already enabled";
                } else {
                    tablePointInTimeRecoveryStatusAnalysis.severity = SeverityStatus.Warning;
                    tablePointInTimeRecoveryStatusAnalysis.message = "Not enabled";
                    tablePointInTimeRecoveryStatusAnalysis.action = "Enable table PointInTimeRecovery";
                }
                allRegionsAnalysis[region].push(tablePointInTimeRecoveryStatusAnalysis);
            }
        }
        tables_backup_enabled.regions = allRegionsAnalysis;
        return { tables_backup_enabled };
    }
}
