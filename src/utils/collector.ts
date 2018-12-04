import { BaseCollector } from "../collectors/base";
import { CacheUtil } from "./cache";

export class CollectorUtil {
    public static cachedCollect(collector: BaseCollector) {
        const collectorName = collector.constructor.name;
        const session = collector.getSession();
        const sessionCache = CacheUtil.get(session, {});
        sessionCache.collectors = sessionCache.collectors || {};
        if (!sessionCache.collectors[collectorName]) {
            sessionCache.collectors[collectorName] = collector.collect();
        }
        return sessionCache.collectors[collectorName];
    }
}
