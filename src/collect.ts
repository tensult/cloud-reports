import * as flat from "flat";
import * as Collectors from "./collectors";
import { BaseCollector } from "./collectors/base";
import { CollectorUtil, CommonUtil } from "./utils";
import { CacheUtil } from "./utils/cache";
import { LogUtil } from "./utils/log";

export async function collect(params?: {
  moduleNames?: string | string[];
  credentials?: any;
  session?: string;
  regions?: string | string[];
}) {
  let collectParams = params || {};
  let session = collectParams.session || CommonUtil.uniqId();
  try {
    const currentSession = CacheUtil.get(session, { session });
    currentSession.session = currentSession.session || session;
    currentSession.credentials =
      currentSession.credentials || collectParams.credentials;
    CacheUtil.put(session, currentSession);
    const promises: Array<Promise<any>> = [];
    const flatListOfCollectors = flat(Collectors);

    const modules = CommonUtil.string2Array(collectParams.moduleNames);
    const regions = CommonUtil.string2Array(collectParams.regions);
    const filteredCollectorNames = Object.keys(flatListOfCollectors).filter(
      collectorName => {
        if (!collectorName.endsWith("Collector")) {
          return false;
        }
        if (modules.length) {
          modules.push("account");
          return modules.some(moduleName => {
            return collectorName.split(".").indexOf(moduleName) !== -1;
          });
        }
        return true;
      }
    );
    for (const collectorName of filteredCollectorNames) {
      LogUtil.info("Running", collectorName);
      const collector: BaseCollector = new flatListOfCollectors[
        collectorName
      ]();
      collector.setSession(session);
      collector.setRegions(regions);

      const collectorPromise = CollectorUtil.cachedCollect(collector)
        .then(data => {
          LogUtil.info(collectorName, "completed");
          const collectNameSpace = collectorName.replace(/.[A-Za-z0-9]+$/, "");
          return {
            data,
            namespace: collectNameSpace
          };
        })
        .catch(err => {
          LogUtil.error(collectorName, "failed", err);
        });
      promises.push(collectorPromise);
    }
    try {
      const collectorResults = await Promise.all(promises);
      return collectorResults.reduce((result, collectResult) => {
        if (collectResult) {
          result[collectResult.namespace] =
            result[collectResult.namespace] || {};
          result[collectResult.namespace] = Object.assign(
            result[collectResult.namespace],
            collectResult.data
          );
        }
        return result;
      }, {});
    } catch (err) {
      throw err;
    }
  } finally {
    CacheUtil.delete(session);
  }
}
