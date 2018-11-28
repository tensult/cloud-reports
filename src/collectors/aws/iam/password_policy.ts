import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class PasswordPolicyCollector extends BaseCollector {
    public async collect() {
        try {
            const iam = this.getClient("IAM", "us-east-1") as AWS.IAM;
            const passwordPolicyResponse:
                AWS.IAM.GetAccountPasswordPolicyResponse = await iam.getAccountPasswordPolicy().promise();
            const password_policy = passwordPolicyResponse.PasswordPolicy;
            return { password_policy };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
