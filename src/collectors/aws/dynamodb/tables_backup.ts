import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { DynamoDBTableNamesCollector } from "./table_names";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class DynamoDBTableBackupsCollector extends BaseCollector {
    collect() {
        return this.getAllTableBackups();
    }

    private async getAllTableBackups() {

        const serviceName = 'DynamoDB';
        const dynamoDBRegions = this.getRegions(serviceName);
        const tables_backup = {};
        const dynamoDBTableNamesCollector = new DynamoDBTableNamesCollector();
        dynamoDBTableNamesCollector.setSession(this.getSession());
        const tablesData = await CollectorUtil.cachedCollect(dynamoDBTableNamesCollector);
        const tableNames = tablesData.tableNames;
        for (let region of dynamoDBRegions) {
            try {
                let dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
                tables_backup[region] = {};
                for (let tableName of tableNames[region]) {
                    const tableBackupResponse: AWS.DynamoDB.DescribeContinuousBackupsOutput = await dynamoDB.describeContinuousBackups({ TableName: tableName }).promise();
                    tables_backup[region][tableName] = tableBackupResponse.ContinuousBackupsDescription;
                }
            } catch(err) {
                AWSErrorHandler.handle(err, region);
                continue;
            }
        }
        return { tables_backup };
    }
}