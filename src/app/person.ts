import * as moment from 'moment';
import { Charge } from './charge';
import { DateRange } from './date-range';

export class Person {
  index: number;
  name: string;
  stayAllDays: boolean = false;
  dateRange: DateRange;
  guests: Person[];
  isGuest: boolean;

  constructor(index: number, year: number, name: string, isGuest: boolean = false) {
    this.index = index;
    this.name = name;
    this.isGuest = isGuest;
    this.guests = [];
    this.dateRange = new DateRange(year);
  }

  public hasOverlap(charge: Charge): boolean {
    return this.stayAllDays ||
      this.dateRange.startMoment().isSameOrBefore(charge.dateRange.endMoment())
      && this.dateRange.endMoment().isSameOrAfter(charge.dateRange.startMoment());
  }

  public overlapStartDate(charge: Charge): moment.Moment {
    return this.stayAllDays ? charge.dateRange.startMoment() : moment.max(this.dateRange.startMoment(), charge.dateRange.startMoment());
  }

  public overlapEndDate(charge: Charge): moment.Moment {
    return this.stayAllDays ? charge.dateRange.endMoment() : moment.min(this.dateRange.endMoment(), charge.dateRange.endMoment());
  }

  public overlapString(charge: Charge): string {
    return this.overlapStartDate(charge).format('M/D') + ' to ' + this.overlapEndDate(charge).format('M/D');
  }

  public overlapInDays(charge: Charge): number {
    return this.hasOverlap(charge) ? this.overlapEndDate(charge).diff(this.overlapStartDate(charge), 'days') + 1 : 0;
  }

  public payForCharge(charge: Charge, totalDays: number): number {
    return parseFloat(charge.amountStr) / totalDays * this.overlapInDays(charge);
  }
}
