import {ClientsProvider, RegionsProvider} from '../utils';

export abstract class BaseCollector {
    private session?: string;
    abstract collect(params?: any);
    getClient(serviceName: string, region: string) {
        return ClientsProvider.getClient(serviceName, region, this.session);
    }
    getRegions(serviceName: string) {
        return RegionsProvider.getServiceRegions(serviceName);
    }

    setSession(session: string) {
        this.session = session;
    }
    
}