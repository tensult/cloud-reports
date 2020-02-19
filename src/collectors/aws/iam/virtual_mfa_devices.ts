import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

import { IDictionary } from "../../../types";

export class VirtualMFADevicesCollector extends BaseCollector {
  private context: IDictionary<any> = {};
  public getContext() {
    return this.context;
  }

  private iam = new AWS.IAM({ region: "us-east-1" });
  public collect() {
    return this.listVirtualMFADevices();
  }

  private async listVirtualMFADevices() {
    try {
      const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
      let fetchPending = true;
      let marker: string | undefined;
      let mfaVirtualDevices: AWS.IAM.VirtualMFADevice[] = [];
      while (fetchPending) {
        const iamMfaDevicesData: AWS.IAM.ListVirtualMFADevicesResponse = await iam
          .listVirtualMFADevices({ Marker: marker })
          .promise();
        mfaVirtualDevices = mfaVirtualDevices.concat(
          iamMfaDevicesData.VirtualMFADevices
        );
        marker = iamMfaDevicesData.Marker;
        fetchPending = iamMfaDevicesData.IsTruncated === true;
        await CommonUtil.wait(200);
      }
      return { mfaVirtualDevices };
    } catch (error) {
      AWSErrorHandler.handle(error);
    }
  }
}
