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

    public static fromNow(date: string | Date | number) {
        return Moment(date).fromNow();
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

    public static string2Array(names?: string | string[]) {
        if (!names || names === "all") {
          return [];
        }
        if (Array.isArray(names)) {
          names;
        } else if (typeof names === "string") {
          return names.split(",");
        }
        return [];
      }
}
