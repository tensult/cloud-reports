import { Dictionary } from './types';
import { CollectorUtil } from './utils';
import * as Collectors from './collectors';
import * as flat from 'flat';

export async function collect(moduleName?: string) {
    const promises: Promise<any>[] = [];
    const flatListOfCollectors = flat(Collectors);
    
    for (let collectorName in flatListOfCollectors) {
        if(!collectorName.endsWith('Collector')) {
            continue;
        }
        if(moduleName && !collectorName.includes(moduleName)) {
            continue;
        }
        const collectorPromise = CollectorUtil.cachedCollect(new flatListOfCollectors[collectorName]()).then((data) => {
            const collectNameSpace = collectorName.replace(/.[A-Za-z]+$/, '');
            return {
                data,
                namespace: collectNameSpace
            }
        }).catch((err) => {
            console.error(collectorName, "failed", err);
        });
        promises.push(collectorPromise);
    }
    try{
        const collectorResults = await Promise.all(promises);
        return collectorResults.reduce((result, collectResult) => {
            if(collectResult) {
                result[collectResult.namespace] = result[collectResult.namespace] || {};
                result[collectResult.namespace] = Object.assign(result[collectResult.namespace], collectResult.data);
            }
            return result;
        }, {});
    } catch(err) {
        throw err;
    }
}








