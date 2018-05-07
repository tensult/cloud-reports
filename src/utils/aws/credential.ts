import {STS} from 'aws-sdk';
const sts = new STS();

export namespace CredentialsUtil {
    export const getCredentialsFromRole = async (roleArn: string, externalId?: string) => {
        const stsResponse = await sts.assumeRole({
            RoleArn: roleArn,
            ExternalId: externalId,
            RoleSessionName: "TensultCloudReports"
        }).promise();
        if(!stsResponse.Credentials) {
            throw new Error("STS assumeRole failed, roleArn=" + roleArn + " externalId=" + externalId);
        }
        return {
            accessKeyId: stsResponse.Credentials.AccessKeyId,
            secretAccessKey: stsResponse.Credentials.SecretAccessKey,
            sessionToken: stsResponse.Credentials.SessionToken
        }
    }
}