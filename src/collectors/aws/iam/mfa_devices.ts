import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class MFADevicesCollector extends BaseCollector {
    public collect() {
        return this.listMfaDevices();
    }

    private async listMfaDevices() {
        try {
            const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
            let fetchPending = true;
            let marker: string | undefined;
            let mfaDevices: AWS.IAM.MFADevice[] = [];
            while (fetchPending) {
                const iamMfaDevicesData: AWS.IAM.ListMFADevicesResponse = await iam.listMFADevices({ Marker: marker }).promise();
                mfaDevices = mfaDevices.concat(iamMfaDevicesData.MFADevices);
                marker = iamMfaDevicesData.Marker;
                fetchPending = iamMfaDevicesData.IsTruncated === true;
            }
            return { mfaDevices };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
