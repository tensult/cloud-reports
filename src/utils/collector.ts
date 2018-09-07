import { CacheUtil } from './cache';
import {BaseCollector} from '../collectors/base';

export class CollectorUtil{
    static cachedCollect(collector: BaseCollector) {
        const collectorName = collector.constructor.name;
        const session = collector.getSession();
        const sessionCache = CacheUtil.get(session, {});
        sessionCache.collectors = sessionCache.collectors || {};
        if(!sessionCache.collectors[collectorName]) {
            sessionCache.collectors[collectorName] = collector.collect();
        }
        return sessionCache.collectors[collectorName];
    }
} 