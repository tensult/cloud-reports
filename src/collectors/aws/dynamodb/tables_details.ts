import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { DynamoDBTableNamesCollector } from "./table_names";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from '../../../utils/aws';

export class DynamoDBTablesDetailsCollector extends BaseCollector {
    collect() {
        return this.getAllTablesDetails();
    }

    private async getAllTablesDetails() {

        const serviceName = 'DynamoDB';
        const dynamoDBRegions = this.getRegions(serviceName);
        const tables_details = {};
        const dynamoDBTableNamesCollector = new DynamoDBTableNamesCollector();
        dynamoDBTableNamesCollector.setSession(this.getSession());
        const tablesData = await CollectorUtil.cachedCollect(dynamoDBTableNamesCollector);
        const tableNames = tablesData.tableNames;
        for (let region of dynamoDBRegions) {
            try {
                let dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
                tables_details[region] = [];
                for (let tableName of tableNames[region]) {
                    const tableResponse: AWS.DynamoDB.DescribeTableOutput = await dynamoDB.describeTable({ TableName: tableName }).promise();
                    if(tableResponse.Table) {
                        tables_details[region].push(tableResponse.Table);
                    }
                }
            } catch(err) {
                AWSErrorHandler.handle(err, region);
                continue;
            }
        }
        return { tables_details };
    }
}