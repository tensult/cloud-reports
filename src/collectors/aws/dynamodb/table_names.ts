import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class DynamoDBTableNamesCollector extends BaseCollector {
    collect() {
        return this.getAllTableNames();
    }

    private async getAllTableNames() {
        const serviceName = 'DynamoDB';
        const dynamoDBRegions = this.getRegions(serviceName);
        const tableNames = {};

        for (let region of dynamoDBRegions) {
            try {
                let dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
                tableNames[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const tableNamesResponse: AWS.DynamoDB.ListTablesOutput = await dynamoDB.listTables({ ExclusiveStartTableName: marker }).promise();
                    if (tableNamesResponse.TableNames) {
                        tableNames[region] = tableNames[region].concat(tableNamesResponse.TableNames);
                    }
                    marker = tableNamesResponse.LastEvaluatedTableName;
                    fetchPending = marker !== undefined;
                }
            } catch (err) {
                LogUtil.error(err);
                continue;
            }
        }
        return { tableNames };
    }
}