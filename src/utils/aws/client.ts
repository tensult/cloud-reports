import {Dictionary} from '../../types';
import * as AWS from 'aws-sdk';

export class ClientsProvider {
    private static _cache:Dictionary<Dictionary<AWS.Service>> = {};
    static getClient(serviceName: string, region: string): AWS.Service {
        if (!ClientsProvider._cache[serviceName] || !ClientsProvider._cache[serviceName][region] ) {
            ClientsProvider._cache[serviceName] = ClientsProvider._cache[serviceName] || {};
            ClientsProvider._cache[serviceName][region] = new AWS[serviceName]({region});
        }
        return ClientsProvider._cache[serviceName][region];
    }
}