import {Dictionary} from '../../types';
import * as AWS from 'aws-sdk';

export namespace ClientsUtil {
    const _cache:Dictionary<Dictionary<any>> = {};
    export const getClient = (serviceName: string, region: string) => {
        if (!_cache[serviceName] || !_cache[serviceName][region] ) {
            _cache[serviceName] = _cache[serviceName] || {};
            _cache[serviceName][region] = new AWS[serviceName]({region});
        }
        return _cache[serviceName][region];
    }
}