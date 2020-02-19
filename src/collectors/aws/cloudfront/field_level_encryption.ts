import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class FieldLevelEncryptionCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllFieldLevelEncryption();
  }

  private async listAllFieldLevelEncryption() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      let fetchPending = true;
      let marker: string | undefined;
      let field_level_encrypt: AWS.CloudFront.FieldLevelEncryptionSummary[] = [];
      while (fetchPending) {
        const cloudfrontFieldLevelEncryptionData: AWS.CloudFront.ListFieldLevelEncryptionConfigsResult = await cloudfront
          .listFieldLevelEncryptionConfigs({ Marker: marker })
          .promise();
        if (
          cloudfrontFieldLevelEncryptionData.FieldLevelEncryptionList &&
          cloudfrontFieldLevelEncryptionData.FieldLevelEncryptionList.Items
        ) {
          field_level_encrypt = field_level_encrypt.concat(
            cloudfrontFieldLevelEncryptionData.FieldLevelEncryptionList.Items
          );
          marker =
            cloudfrontFieldLevelEncryptionData.FieldLevelEncryptionList
              .NextMarker;
          fetchPending = marker !== undefined && marker !== null;
          await CommonUtil.wait(200);
        } else {
          fetchPending = false;
        }
      }
      return { field_level_encrypt };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
