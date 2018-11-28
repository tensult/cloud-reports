import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { BaseAnalyzer } from "../../base";

export class DynamoDBTablesCapacitiesAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allTablesDetails = params.tables_details;
        if (!allTablesDetails) {
            return undefined;
        }
        const tables_capacities: ICheckAnalysisResult = { type: CheckAnalysisType.PerformanceEfficiency };
        tables_capacities.what = "Are you reviewing DynamoDB table capacities regularly?";
        tables_capacities.why = `DynamoDB table capacities effect both
        performance and cost so we need to review them regularly`;
        tables_capacities.recommendation = "Recommended to review DynamoDB table capacities at least once in a month";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allTablesDetails) {
            const regionTablesDetails = allTablesDetails[region];
            allRegionsAnalysis[region] = [];
            for (const table of regionTablesDetails) {
                const tableStatusAnalysis: IResourceAnalysisResult = {};
                tableStatusAnalysis.resource = {
                    capacities: table.ProvisionedThroughput,
                    tableName: table.TableName,
                };
                tableStatusAnalysis.resourceSummary = {
                    name: "Table",
                    value: table.TableName,
                };

                tableStatusAnalysis.severity = SeverityStatus.Info;
                tableStatusAnalysis.message = `Read:
                 ${table.ProvisionedThroughput.ReadCapacityUnits},
                 Write: ${table.ProvisionedThroughput.WriteCapacityUnits}`;
                tableStatusAnalysis.action = "Review once in every month";

                allRegionsAnalysis[region].push(tableStatusAnalysis);
            }
        }
        tables_capacities.regions = allRegionsAnalysis;
        return { tables_capacities };
    }
}
