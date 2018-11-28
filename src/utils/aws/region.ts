import { awsRegions } from "./regions_data";

export class AWSRegionsProvider {
    public static getServiceRegions(serviceName: string): string[] {
        return awsRegions[serviceName];
    }
}
