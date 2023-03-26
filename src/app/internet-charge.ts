import { Charge } from './charge';
import { Equation } from './equation';
import { InternetMap } from './internet-map';
import { Person } from './person';

export class InternetCharge extends Charge {
  savedInternetMaps: InternetMap[] = [];

  public internetMaps(people: Person[]): InternetMap[] {
    const res = [];
    const current = this.dateRange.startMoment().clone();
    let prePeople: Person[] = [];
    let currentPeople: Person[] = [];
    let intervalStart = this.dateRange.startMoment();
    while (current.isSameOrBefore(this.dateRange.endMoment())) {
      currentPeople = [];
      for (const person of people) {
        if (person.stayAllDays ||
          current.isSameOrAfter(person.dateRange.startMoment()) && current.isSameOrBefore(person.dateRange.endMoment())) {
          currentPeople.push(person);
        }
      }
      if (!this.eqSet(currentPeople, prePeople)) {
        if (current.isAfter(this.dateRange.startMoment())) {
          res.push(new InternetMap(intervalStart.clone(), current.clone().subtract(1, 'days'), Array.from(prePeople)));
        }
        intervalStart = current.clone();
        prePeople = Array.from(currentPeople);
      }
      current.add(1, 'days');
    }
    res.push(new InternetMap(intervalStart.clone(), this.dateRange.endMoment(), Array.from(currentPeople)));
    this.savedInternetMaps = res;
    return res;
  }

  public eqSet(as: Person[], bs: Person[]): boolean {
    if (as.length !== bs.length) {
      return false;
    }
    for (const a of as) {
      if (!bs.includes(a)) {
        return false;
      }
    }
    return true;
  }

  public personCharge(person: Person): Equation {
    const strs = []; // 0.97 / people * days + ...
    let amount = 0;
    for (const internetMap of this.savedInternetMaps) {
      if (internetMap.people.includes(person)) {
        strs.push(`${this.dailyRate().toFixed(2)} / ${internetMap.people.length} *
        ${internetMap.endMoment.diff(internetMap.startMoment, 'days') + 1}`);
        amount += this.dailyRate() / internetMap.people.length * (internetMap.endMoment.diff(internetMap.startMoment, 'days') + 1);
      }
    }
    return new Equation(`${strs.join(' + ')} = ${amount.toFixed(2)}`, amount);
  }
}
