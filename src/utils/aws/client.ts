import {Dictionary} from '../../types';
import * as AWS from 'aws-sdk';

export class ClientsProvider {
    private static _cache:Dictionary<Dictionary<AWS.Service>> = {};
    static getClient(serviceName: string, region: string, session: string = "default"): AWS.Service {
        ClientsProvider._cache[session] = ClientsProvider._cache[session] || {};
        if (!ClientsProvider._cache[session][serviceName] || !ClientsProvider._cache[session][serviceName][region] ) {
            ClientsProvider._cache[session][serviceName] = ClientsProvider._cache[session][serviceName] || {};
            ClientsProvider._cache[session][serviceName][region] = new AWS[serviceName]({region, credentials: ClientsProvider._cache[session].credentials});
        }
        return ClientsProvider._cache[session][serviceName][region];
    }

    static setCredentials(credentials, session: string = "default") {
        ClientsProvider._cache[session] = ClientsProvider._cache[session] || {};
        ClientsProvider._cache[session].credentials = credentials;
    }
}