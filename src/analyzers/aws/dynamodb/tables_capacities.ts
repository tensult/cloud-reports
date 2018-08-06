import { BaseAnalyzer } from '../../base'
import { CheckAnalysisResult, ResourceAnalysisResult, Dictionary, SeverityStatus, CheckAnalysisType } from '../../../types';

export class DynamoDBTablesCapacitiesAnalyzer extends BaseAnalyzer {

    analyze(params: any, fullReport?: any): any {
        const allTablesDetails = params.tables_details;
        if (!allTablesDetails) {
            return undefined;
        }
        const tables_capacities: CheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        tables_capacities.what = "Are you reviewing DynamoDB table capacities regularly?";
        tables_capacities.why = "DynamoDB table capacities effect both performance and cost so we need to review them regularly"
        tables_capacities.recommendation = "Recommended to review DynamoDB table capacities at least once in a month";
        const allRegionsAnalysis: Dictionary<ResourceAnalysisResult[]> = {};
        for (let region in allTablesDetails) {
            let regionTablesDetails = allTablesDetails[region];
            allRegionsAnalysis[region] = [];
            for (let table of regionTablesDetails) {
                let tableStatusAnalysis: ResourceAnalysisResult = {};
                tableStatusAnalysis.resource = {
                    tableName: table.TableName,
                    capacities: table.ProvisionedThroughput
                };
                tableStatusAnalysis.resourceSummary = {
                    name: 'Table',
                    value: table.TableName
                }
                 
                    tableStatusAnalysis.severity = SeverityStatus.Info;
                    tableStatusAnalysis.message = `Read: ${table.ProvisionedThroughput.ReadCapacityUnits}, Write: ${table.ProvisionedThroughput.WriteCapacityUnits}`;
                    tableStatusAnalysis.action = 'Review once in every month';
                
                allRegionsAnalysis[region].push(tableStatusAnalysis);
            }
        }
        tables_capacities.regions = allRegionsAnalysis;
        return { tables_capacities };
    }
}