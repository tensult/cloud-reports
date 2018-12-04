import { LogUtil } from "../log";

export class AWSErrorHandler {
    public static handle(...params: any[]) {
        const errorCode = params && params[0] ? params[0].code : undefined;
        if (errorCode === "OptInRequired" ||
            errorCode === "SubscriptionRequiredException" ||
            errorCode === "InvalidClientTokenId" ||
            errorCode === "AuthFailure" ||
            errorCode === "UnrecognizedClientException"
        ) {
            return;
        }
        throw params;
    }
}
