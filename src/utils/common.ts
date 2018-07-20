import * as Moment from 'moment';

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
    static daysFrom(date: string | Date | number) {
        return Math.floor(Moment.duration(Moment().diff(Moment(date))).asDays());
    }
}