import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { DynamoDBTableNamesCollector } from "./table_names";

import { IDictionary } from "../../../types";

export class DynamoDBTableBackupsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllTableBackups();
  }

  private async getAllTableBackups() {
    const serviceName = "DynamoDB";
    const dynamoDBRegions = this.getRegions(serviceName);
    const tables_backup = {};
    const dynamoDBTableNamesCollector = new DynamoDBTableNamesCollector();
    dynamoDBTableNamesCollector.setSession(this.getSession());
    try {
      const tablesData = await CollectorUtil.cachedCollect(
        dynamoDBTableNamesCollector
      );
      const tableNames = tablesData.tableNames;
      for (const region of dynamoDBRegions) {
        try {
          const dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
          tables_backup[region] = {};
          this.context[region] = region;

          for (const tableName of tableNames[region]) {
            const tableBackupResponse: AWS.DynamoDB.DescribeContinuousBackupsOutput = await dynamoDB
              .describeContinuousBackups({ TableName: tableName })
              .promise();
            tables_backup[region][tableName] =
              tableBackupResponse.ContinuousBackupsDescription;
            await CommonUtil.wait(200);
          }
        } catch (err) {
          AWSErrorHandler.handle(err, region);
          continue;
        }
      }
    } catch (err) {
      AWSErrorHandler.handle(err);
    }
    return { tables_backup };
  }
}
