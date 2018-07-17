import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";

export class MFADevicesCollector extends BaseCollector {
    collect(callback: (err?: Error, data?: any) => void) {
        return this.listMfaDevices();
    }

    private async listMfaDevices() {
        try {
            const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
            let fetchPending = true;
            let marker: string | undefined = undefined;
            let mfaDevices: AWS.IAM.MFADevice[] = [];
            while (fetchPending) {
                let iamMfaDevicesData: AWS.IAM.ListMFADevicesResponse = await iam.listMFADevices({ Marker: marker }).promise();
                mfaDevices = mfaDevices.concat(iamMfaDevicesData.MFADevices);
                marker = iamMfaDevicesData.Marker;
                fetchPending = iamMfaDevicesData.IsTruncated === true;
            }
            return { mfaDevices };
        } catch (error) {
            console.error(error);
        }
    }
}