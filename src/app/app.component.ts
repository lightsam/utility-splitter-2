import * as moment from 'moment';
import { Component } from '@angular/core';
import { Charge } from './charge';
import { Equation } from './equation';
import { InternetCharge } from './internet-charge';
import { Person } from './person';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  internetStr = 'Internet';
  electricDeliveryStr = 'Electric Delivery Charges';
  siliconValleyCleanEnergyStr = 'Silicon Valley Clean Energy Electric Generation Charges';
  gasStr = 'Gas Charges';
  waterStr = 'water';
  sewerGargageStr = 'sewer and gargage';
  electricCreditStr = 'Electric Delivery Climate Credit';
  gasCreditStr = 'Gas Climate Credit';
  hideButtons = false;
  hideYears = false;
  year = moment().year();
  people: Person[] = [
    new Person(0, this.year, 'Yutao')
  ];
  internetCharge = new InternetCharge(0, this.year, this.internetStr, '19.99');
  charges: Charge[] = [
    new Charge(0, this.year, this.electricDeliveryStr, '')
  ];
  electricCredit: Charge = new Charge(0, this.year, this.electricCreditStr, '-38.39');
  gasCredit: Charge = new Charge(0, this.year, this.gasCreditStr, '-52.78');

  public addPerson(): void {
    this.people.push(new Person(this.people.length, this.year, ''));
  }

  public deletePerson(index: number): void {
    this.people.splice(index, 1);
    for (let i = 0; i < this.people.length; i++) {
      this.people[i].index = i;
    }
  }

  public addGuest(person: Person): void {
    const guest = new Person(this.people.length, this.year, `${person.name}'s guest`, true);
    this.people.push(guest);
    person.guests.push(guest);
  }

  public addCharge(name: string = ''): void {
    this.charges.push(new Charge(this.charges.length, this.year, name, ''));
  }

  public deleteCharge(index: number): void {
    this.charges.splice(index, 1);
    for (let i = 0; i < this.charges.length; i++) {
      this.charges[i].index = i;
    }
  }

  public totalDays(charge: Charge): number {
    let total = 0;
    for (const person of this.people) {
      total += person.overlapInDays(charge);
    }
    return total;
  }

  public personChargeAmounts(person: Person): number[] {
    return this.charges.map(charge => person.payForCharge(charge, this.totalDays(charge)));
  }

  public personTotalAmount(person: Person): Equation {
    const personChargeAmounts = this.personChargeAmounts(person);
    const normalChargeStr = personChargeAmounts.map(a => a.toFixed(2)).join(' + ');
    const result = this.internetCharge.personCharge(person).result + personChargeAmounts.reduce((a, b) => a + b, 0) +
      this.personElectricCredit(person).result + this.personGasCredit(person).result;
    return new Equation(`${this.internetCharge.personCharge(person).result.toFixed(2)} +
    ${normalChargeStr} ${this.personElectricCredit(person).result < 0 ? this.personElectricCredit(person).result.toFixed(2) : '- 0'}
    ${this.personGasCredit(person).result < 0 ? this.personGasCredit(person).result.toFixed(2) : '- 0'} = ${result.toFixed(2)}`, result);
  }

  public personWithGuestsTotalAmount(person: Person): Equation {
    const personWithGuestAmounts = [this.personTotalAmount(person).result].concat(person.guests.map(p => this.personTotalAmount(p).result));
    const result = personWithGuestAmounts.reduce((a, b) => a + b, 0);
    return new Equation(`${personWithGuestAmounts.map(x => x.toFixed(2)).join(' + ')} = ${result.toFixed(2)}`, result);
  }

// Electric Delivery Climate Credit -$28.25. The credit is received twice a year. See EnergyUpgradeCA.org/credit .
// I'm distributing the credit to each day. The more one pays the bill, the more he gets the credit.
//   Lingxi and his guests -28.25 * (29 / (365 / 2)) * 13.95/31.39= -1.99
//   Tarence -28.25 * (29 / (365 / 2)) * 4.80/31.39 = -0.69
  public personElectricCredit(person: Person): Equation {
    let electricAmount = 0;
    let durationInDays = 0;
    let personElectricAmount = 0;
    for (const charge of this.charges) {
      if (charge.name === this.electricDeliveryStr) {
        durationInDays += charge.dateRange.durationInDays();
        electricAmount += parseFloat(charge.amountStr) || 0;
        personElectricAmount += person.payForCharge(charge, this.totalDays(charge)) || 0;
      }
    }
    const result = (electricAmount === 0 ? 0 : parseFloat(this.electricCredit.amountStr) * (durationInDays / (365 / 2))
      / electricAmount * personElectricAmount);
    return new Equation(
      `${this.electricCredit.amountStr} * (${durationInDays} / (365 / 2)) /
       ${electricAmount} * ${personElectricAmount.toFixed(2)} = ${result.toFixed(2)}`,
      result
    );
  }

  //  Gas Climate Credit -$25.96. The credit is received once a year. See EnergyUpgradeCA.org/credit .
  //  I'm distributing the credit to each day. The more one pays the bill, the more he gets the credit.
  //   Lingxi and his guests -25.96 * (29/365) * 10.51/23.75 = -0.91
  //   Tarence -25.96 * (29/365) * 3.73/23.75 = -0.32
  public personGasCredit(person: Person): Equation {
    let gasAmount = 0;
    let durationInDays = 0;
    let personGasAmount = 0;
    for (const charge of this.charges) {
      if (charge.name === this.gasStr) {
        durationInDays += charge.dateRange.durationInDays();
        gasAmount += parseFloat(charge.amountStr) || 0;
        personGasAmount += person.payForCharge(charge, this.totalDays(charge));
      }
    }
    const result = (gasAmount === 0 ? 0 : parseFloat(this.gasCredit.amountStr) * (durationInDays / 365) / gasAmount * personGasAmount);
    return new Equation(
      `${this.gasCredit.amountStr} * (${durationInDays} / 365) /
       ${gasAmount.toFixed(2)} * ${personGasAmount.toFixed(2)} = ${result.toFixed(2)}`,
      result
    );
  }

}
