import {BaseCollector} from '../collectors/base';
import {Dictionary} from '../types'

export namespace CollectorUtil{
    const _cache: Dictionary<any> = {}; 
    export const cachedCollect = (collector: BaseCollector) => {
        const collectorName = collector.constructor.name;
        if(!_cache[collectorName]) {
            _cache[collectorName] = collector.collect();
        }
        return _cache[collectorName];
    }
} 