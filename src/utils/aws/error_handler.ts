import { AWSError } from "aws-sdk";

export class AWSErrorHandler {
    public static handle(error: AWSError, ...params: any[]) {
        const errorCode = error.code;
        if (errorCode === "OptInRequired" ||
            errorCode === "SubscriptionRequiredException" ||
            errorCode === "InvalidClientTokenId" ||
            errorCode === "AuthFailure" ||
            errorCode === "UnrecognizedClientException" ||
            errorCode === "NoSuchEntity"
        ) {
            return;
        }
        throw this.makeError(error, params);
    }

    private static makeError(error: AWSError, params: any[]) {
        if (params && params.length) {
            return new Error(error.code + ":" + error.message + " " + JSON.stringify(params, null, 2));
        }
        return error;
    }
}
