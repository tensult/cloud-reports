import {regions} from './regions_data';

export class RegionsProvider {
    static getServiceRegions(serviceName: string): string[] {
        return regions[serviceName];
    }
}
