import * as moment from 'moment';

export class DateRange {
  startMonth: number = 0;
  startDay: number = 0;
  startYear: number;
  endMonth: number = 0;
  endDay: number = 0;
  endYear: number;

  constructor(year: number) {
    this.startYear = year;
    this.endYear = year;
  }

  public startMoment(): moment.Moment {
    return moment([this.startYear, this.startMonth - 1, this.startDay]);
  }

  public endMoment(): moment.Moment {
    return moment([this.endYear, this.endMonth - 1, this.endDay]);
  }

  public durationInDays(): number {
    return this.endMoment().diff(this.startMoment(), 'days') + 1;
  }
}
