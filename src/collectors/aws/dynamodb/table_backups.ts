import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { DynamoDBTableNamesCollector } from "./tables";
import { CollectorUtil } from "../../../utils";

export class DynamoDBTableBackupsCollector extends BaseCollector {
    collect() {
        return this.getAllTableBackups();
    }

    private async getAllTableBackups() {

        const serviceName = 'DynamoDB';
        const dynamoDBRegions = this.getRegions(serviceName);
        const table_backups = {};
        const tablesData = await CollectorUtil.cachedCollect(new DynamoDBTableNamesCollector());
        const tableNames = tablesData.tableNames;
        for (let region of dynamoDBRegions) {
            try {
                let dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
                table_backups[region] = {};
                for (let tableName of tableNames[region]) {
                    const tableBackupResponse: AWS.DynamoDB.DescribeContinuousBackupsOutput = await dynamoDB.describeContinuousBackups({ TableName: tableName }).promise();
                    table_backups[region][tableName] = tableBackupResponse.ContinuousBackupsDescription;
                }
            } catch(err) {
                console.error(err);
                continue;
            }
        }
        return { table_backups };
    }
}