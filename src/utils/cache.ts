import { IDictionary } from "../types";

export class CacheUtil {

    public static delete(key) {
        delete CacheUtil.cache[key];
    }

    public static get(key, defaultVal?: any) {
        return CacheUtil.cache[key] || defaultVal;
    }

    public static put(key: string, value: any) {
        CacheUtil.cache[key] = value;
    }
    private static cache: IDictionary<any> = {};
}
