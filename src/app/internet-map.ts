import * as moment from 'moment';
import { Person } from './person';

export class InternetMap {
  startMoment: moment.Moment;
  endMoment: moment.Moment;
  people: Person[];

  constructor(startMoment: moment.Moment, endMoment: moment.Moment, people: Person[]) {
    this.startMoment = startMoment;
    this.endMoment = endMoment;
    this.people = people;
  }

  public peopleNameStr(): string {
    return this.people.map(p => p.name).join(', ');
  }
}
