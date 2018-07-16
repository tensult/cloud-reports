export class CommonUtil {
    static wait(timeInMills) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), timeInMills);
        });
    }
    static removeDuplicates(array: any[]) {
        if(!array) {
            return [];
        }
        return array.filter((current, index) => {
            return array.indexOf(current) === index;
        });
    }
}