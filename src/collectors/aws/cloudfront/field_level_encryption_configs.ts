import * as AWS from "aws-sdk";
import { CollectorUtil, CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { FieldLevelEncryptionCollector } from "./field_level_encryption";

import { IDictionary } from "../../../types";

export class FieldLevelEncryptionconfigsCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  public collect() {
    return this.listAllFieldLevelEncryptionconfigs();
  }

  private async listAllFieldLevelEncryptionconfigs() {
    try {
      const cloudfront = this.getClient(
        "CloudFront",
        "us-east-1"
      ) as AWS.CloudFront;
      const field_level_encrypt_Collector = new FieldLevelEncryptionCollector();
      field_level_encrypt_Collector.setSession(this.getSession());
      const field_level_encrypt_Data = await CollectorUtil.cachedCollect(
        field_level_encrypt_Collector
      );
      const field_level_encrypt_configs = {};
      for (const field_level_encrypt of field_level_encrypt_Data.field_level_encrypt) {
        const cloudfrontFieldLevelEncryptionData: AWS.CloudFront.GetFieldLevelEncryptionConfigResult = await cloudfront
          .getFieldLevelEncryptionConfig({ Id: field_level_encrypt.Id })
          .promise();
        field_level_encrypt_configs[field_level_encrypt.Id] =
          cloudfrontFieldLevelEncryptionData.FieldLevelEncryptionConfig;
        await CommonUtil.wait(200);
      }
      return { field_level_encrypt_configs };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
