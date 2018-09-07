import * as AWS from 'aws-sdk';
import { CacheUtil } from '../cache';

export class ClientsProvider {
    static getClient(serviceName: string, region: string, session: string = "default"): AWS.Service {
        const sessionCache = CacheUtil.get(session, {});
        sessionCache.clients = sessionCache.clients || {};
        if (!sessionCache.clients[serviceName] || !sessionCache.clients[serviceName][region] ) {
            sessionCache.clients[serviceName] = sessionCache.clients[serviceName] || {};
            sessionCache.clients[serviceName][region] = new AWS[serviceName]({region, credentials: sessionCache.credentials});
        }
        return sessionCache.clients[serviceName][region];
    }

    static setCredentials(credentials, session: string = "default") {
        const sessionCache = CacheUtil.get(session, {});
        sessionCache.credentials = credentials;
        CacheUtil.put(session, sessionCache);
    }
}