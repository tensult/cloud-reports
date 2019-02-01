
export class ArrayUtil {
    static toArray(obj: any) {
        if (!Array.isArray(obj)) {
            return [obj];
        }
        return obj;
    }

    static isNotBlank(input: any) {
        let values = input;
        if (!Array.isArray(input)) {
            values = [input];
        }
        return values.length && values.every((value) => value && value !== 'all' && value !== 'null' && value !== 'undefined');
    }
}
