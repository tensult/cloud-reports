import * as AWS from "aws-sdk";

export class AWSCredentialsProvider {

    public static getCredentials(profile: string) {
        AWS.CredentialProviderChain.defaultProviders = [
            function() { return new AWS.EnvironmentCredentials("AWS"); },
            function() { return new AWS.EnvironmentCredentials("AMAZON"); },
            function() {
                if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
                    return new AWS.ECSCredentials();
                } else {
                    return new AWS.EC2MetadataCredentials();
                }
            },
            function() { return new AWS.SharedIniFileCredentials({ profile }); },
        ];
        const credentialsChain = new AWS.CredentialProviderChain();
        return credentialsChain.resolvePromise();
    }
}
