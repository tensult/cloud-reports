import {regions} from './regions_data';

export namespace RegionsUtil {
    export const getServiceRegions = (serviceName: string): string[] => {
        return regions[serviceName];
    }
}
