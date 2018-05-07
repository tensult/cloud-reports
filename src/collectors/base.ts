import {ClientsUtil, RegionsUtil} from '../utils';

export abstract class BaseCollector {
    abstract collect(params?: any);
    getClient(serviceName: string, region: string) {
        return ClientsUtil.getClient(serviceName, region);
    }
    getRegions(serviceName: string) {
        return RegionsUtil.getServiceRegions(serviceName);
    }
}