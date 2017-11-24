import {ClientsProvider, RegionsProvider} from '../utils';

export abstract class BaseCollector {
    abstract collect(params?: any);
    getClient(serviceName: string, region: string) {
        return ClientsProvider.getClient(serviceName, region);
    }
    getRegions(serviceName: string) {
        return RegionsProvider.getServiceRegions(serviceName);
    }
}