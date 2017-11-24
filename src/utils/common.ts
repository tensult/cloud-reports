export class CommonUtil {
    static wait(timeInMills) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), timeInMills);
        });
    }
}