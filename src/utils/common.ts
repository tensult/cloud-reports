export namespace CommonUtil {
    export const wait = (timeInMills)  => {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), timeInMills);
        });
    }
}