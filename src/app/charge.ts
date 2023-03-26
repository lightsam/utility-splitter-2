import { DateRange } from './date-range';

export class Charge {
  index: number;
  name: string;
  dateRange: DateRange;
  amountStr: string;

  constructor(index: number, year: number, name: string, amountStr: string) {
    this.index = index;
    this.name = name;
    this.amountStr = amountStr;
    this.dateRange = new DateRange(year);
  }

  public dailyRate(): number {
    return parseFloat(this.amountStr) / this.dateRange.durationInDays();
  }
}
