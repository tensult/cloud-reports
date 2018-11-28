import * as AWS from "aws-sdk";
import { CacheUtil } from "../cache";

export class AWSClientsProvider {
    public static getClient(serviceName: string, region: string, session: string = "default"): AWS.Service {
        const sessionCache = CacheUtil.get(session, {});
        sessionCache.clients = sessionCache.clients || {};
        if (!sessionCache.clients[serviceName] || !sessionCache.clients[serviceName][region]) {
            sessionCache.clients[serviceName] = sessionCache.clients[serviceName] || {};
            sessionCache.clients[serviceName][region] = new AWS[serviceName]({
                credentials: sessionCache.credentials, region,
            });
        }
        return sessionCache.clients[serviceName][region];
    }

    public static setCredentials(credentials, session: string = "default") {
        const sessionCache = CacheUtil.get(session, {});
        sessionCache.credentials = credentials;
        CacheUtil.put(session, sessionCache);
    }
}
