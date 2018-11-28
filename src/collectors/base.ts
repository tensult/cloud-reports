import {AWSClientsProvider, AWSRegionsProvider} from "../utils";

export abstract class BaseCollector {
    private session: string = "default";
    public abstract collect(params?: any);
    public getClient(serviceName: string, region: string) {
        return AWSClientsProvider.getClient(serviceName, region, this.session);
    }
    public getRegions(serviceName: string) {
        return AWSRegionsProvider.getServiceRegions(serviceName);
    }

    public setSession(session: string = "default") {
        this.session = session;
    }

    public getSession() {
        return this.session;
    }

}
