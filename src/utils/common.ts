import * as Moment from "moment";

export class CommonUtil {
    public static wait(timeInMills) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), timeInMills);
        });
    }
    public static removeDuplicates(array: any[]) {
        if (!array) {
            return [];
        }
        return array.filter((current, index) => {
            return array.indexOf(current) === index;
        });
    }
    public static daysFrom(date: string | Date | number) {
        return Math.floor(Moment.duration(Moment().diff(Moment(date))).asDays());
    }

    public static uniqId() {
        return `${Date.now()}_${Math.floor(Math.random() * 10000000)}`;
    }

    public static toArray(obj) {
        if (Array.isArray(obj)) {
            return obj;
        } else {
            return [obj];
        }
    }
}
