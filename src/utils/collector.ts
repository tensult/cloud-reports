import { BaseCollector } from "../collectors/base";
import { AWSErrorHandler } from "./aws";
import { CacheUtil } from "./cache";
import { CommonUtil } from "./common";

export class CollectorUtil {
    public static async cachedCollect(collector: BaseCollector) {
        try {
            const collectorName = collector.constructor.name;
            const session = collector.getSession();
            const sessionCache = CacheUtil.get(session, {});
            sessionCache.collectors = sessionCache.collectors || {};
            if (!sessionCache.collectors[collectorName]) {
                await CommonUtil.wait(500);
                sessionCache.collectors[collectorName] = collector.collect();
            }
            return await sessionCache.collectors[collectorName];
        } catch (error) {
            AWSErrorHandler.handle(error, collector.getContext());
        }
    }
}
