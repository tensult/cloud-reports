import { AWSClientsProvider, AWSRegionsProvider, CommonUtil } from "../utils";
import { IDictionary } from "../types";

export abstract class BaseCollector {
  private session: string = "default";
  private regions: string[] | undefined;
  public abstract getContext(): IDictionary<any>;
  public abstract collect(params?: any);
  public getClient(serviceName: string, region: string) {
    return AWSClientsProvider.getClient(serviceName, region, this.session);
  }

  public setRegions(regions: string | string[]) {
    this.regions = CommonUtil.toArray(regions);
  }

  public getRegions(serviceName: string) {
    return (this.regions && this.regions.length) ? this.regions : AWSRegionsProvider.getServiceRegions(serviceName);
  }

  public setSession(session: string = "default") {
    this.session = session;
  }

  public getSession() {
    return this.session;
  }
}
