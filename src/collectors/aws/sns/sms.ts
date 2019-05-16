import * as AWS from "aws-sdk";
import { CommonUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class SMSCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllSMS();
    }
    private async getAllSMS() {

        const serviceName = "SNS";
        const snsRegions = this.getRegions(serviceName);
        const sms = {};

        for (const region of snsRegions) {
            try {
                const sns = this.getClient(serviceName, region) as AWS.SNS;
                sms[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const smsResponse:
                        AWS.SNS.ListSubscriptionsResponse =
                        await sns.listSubscriptions({ NextToken: marker }).promise();
                    if (smsResponse.Subscriptions) {
                        sms[region] = sms[region].concat(smsResponse.Subscriptions);
                    }
                    marker = smsResponse.NextToken;
                    fetchPending = marker !== undefined && marker !== null;
                    await CommonUtil.wait(200);
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { sms };
    }

}
