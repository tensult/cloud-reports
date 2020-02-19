import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class DynamoDBTableNamesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.getAllTableNames();
  }

  private async getAllTableNames() {
    const serviceName = "DynamoDB";
    const dynamoDBRegions = this.getRegions(serviceName);
    const tableNames = {};

    for (const region of dynamoDBRegions) {
      try {
        const dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
        tableNames[region] = [];
        this.context[region] = region;

        let fetchPending = true;
        let marker: string | undefined;
        while (fetchPending) {
          const tableNamesResponse: AWS.DynamoDB.ListTablesOutput = await dynamoDB
            .listTables({ ExclusiveStartTableName: marker })
            .promise();
          if (tableNamesResponse.TableNames) {
            tableNames[region] = tableNames[region].concat(
              tableNamesResponse.TableNames
            );
          }
          marker = tableNamesResponse.LastEvaluatedTableName;
          fetchPending = marker !== undefined;
          await CommonUtil.wait(200);
        }
      } catch (err) {
        AWSErrorHandler.handle(err);
        continue;
      }
    }
    return { tableNames };
  }
}
