import {BaseCollector} from '../collectors/base';
import {Dictionary} from '../types'

export class CollectorUtil{
    private static cache: Dictionary<any> = {}; 
    static cachedCollect(collector: BaseCollector) {
        const collectorName = collector.constructor.name;
        if(!CollectorUtil.cache[collectorName]) {
            CollectorUtil.cache[collectorName] = collector.collect();
        }
        return CollectorUtil.cache[collectorName];
    }
} 