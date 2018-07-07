import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class DynamoDBTablesBackupEnabledAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTablesBackupStatuses = params.tables_backup;
        if (!allTablesBackupStatuses) {
            return undefined;
        }
        console.log("allTablesBackupStatuses", params.tables_backup)
        const tables_backup_enabled: CheckAnalysisResult = { type: CheckAnalysisType.Reliability };
        tables_backup_enabled.what = "Are there any DynamoDB table without backup enabled?";
        tables_backup_enabled.why = "DynamoDB can be accidentally deleted and data can be lost when tables are without backup enabled"
        tables_backup_enabled.recommendation = "Recommended to enable backup for all production critical tables";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allTablesBackupStatuses) {
            let regionTablesBackupStatuses = allTablesBackupStatuses[region];
            allRegionsAnalysis[region] = [];
            for (let tableName in regionTablesBackupStatuses) {
                let tableBackupStatus = regionTablesBackupStatuses[tableName];
                let tableBackupEnableStatusAnalysis: ResourceAnalysisResult = {};
                tableBackupEnableStatusAnalysis.resource = {
                    tableName: tableName,
                    tableBackupStatus: tableBackupStatus.ContinuousBackupsStatus
                };
                tableBackupEnableStatusAnalysis.resourceSummary = {
                    name: 'Table',
                    value: tableName
                }
                if (tableBackupStatus.ContinuousBackupsStatus) {
                    tableBackupEnableStatusAnalysis.severity = SeverityStatus.Good;
                    tableBackupEnableStatusAnalysis.message = 'Backup already enabled';
                } else {
                    tableBackupEnableStatusAnalysis.severity = SeverityStatus.Failure;
                    tableBackupEnableStatusAnalysis.message = 'Not enabled';
                    tableBackupEnableStatusAnalysis.action = 'Enable table backup';
                }
                allRegionsAnalysis[region].push(tableBackupEnableStatusAnalysis);

                let tablePointInTimeRecoveryStatusAnalysis: ResourceAnalysisResult = {};
                tablePointInTimeRecoveryStatusAnalysis.resource = {
                    tableName: tableName,
                    tablePointInTimeRecoveryStatus: tableBackupStatus.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus
                };
                tablePointInTimeRecoveryStatusAnalysis.resourceSummary = {
                    name: 'Table',
                    value: tableName
                }
                if (tableBackupStatus.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus) {
                    tablePointInTimeRecoveryStatusAnalysis.severity = SeverityStatus.Good;
                    tablePointInTimeRecoveryStatusAnalysis.message = 'PointInTimeRecovery already enabled';
                } else {
                    tablePointInTimeRecoveryStatusAnalysis.severity = SeverityStatus.Warning;
                    tablePointInTimeRecoveryStatusAnalysis.message = 'Not enabled';
                    tablePointInTimeRecoveryStatusAnalysis.action = 'Enable table PointInTimeRecovery';
                }
                allRegionsAnalysis[region].push(tablePointInTimeRecoveryStatusAnalysis);
            }
        }
        tables_backup_enabled.regions = allRegionsAnalysis;
        return { tables_backup_enabled };
    }
}