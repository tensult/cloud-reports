import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { CommonUtil, CsvUtil } from '../../../utils'
import { LogUtil } from '../../../utils/log';

export class CredentialsReportCollector extends BaseCollector {
    collect() {
        return this.getCredentialsReport();
    }

    private async getCredentialsReport() {
        try {
            const iam = this.getClient('IAM', 'us-east-1') as AWS.IAM;
            let fetchPending = true;
            let credsReport: AWS.IAM.GetCredentialReportResponse = {};
            await iam.generateCredentialReport().promise();
            while (fetchPending) {
                await CommonUtil.wait(1000);
                credsReport = await iam.getCredentialReport().promise();
                fetchPending = credsReport.Content === undefined;
            }
            let credentials = {};
            if (credsReport.Content) {
                credentials = CsvUtil.toObject(credsReport.Content.toString())
            }
            return { credentials }
        } catch (error) {
            LogUtil.error(error);
        }
    }
}
