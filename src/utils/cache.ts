import { Dictionary } from '../types'

export class CacheUtil {
    private static cache: Dictionary<any> = {};

    static delete(key) {
        delete CacheUtil.cache[key];
    }

    static get(key, defaultVal?: any) {
        return CacheUtil.cache[key] || defaultVal;
    }

    static put(key: string, value: any) {
        CacheUtil.cache[key] = value;
    }
} 