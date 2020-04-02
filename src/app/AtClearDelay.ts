import { isSaturday, isSunday, isHoliday } from './functions';
import * as moment from 'moment';
import * as Holidays from 'date-holidays';

export class AttClearDelay {
    startMoment: moment.Moment;
    output: Array<{
        date: string;
        text: string;
    }> = [];

    constructor(_startDate: string) {
        moment.updateLocale('fr', {
            week: {
                dow: 1, // First day of week is Monday
                doy: 4, // First week of year must contain 1 January (7 + 0 - 1)
            },
        });
        this.startMoment = moment(_startDate).startOf('day');
        this.output.push({
            date: this.startMoment.format('DD dddd  MMMM YYYY'),
            text: 'date de départ',
        });
        return this;
    }

    addClearDelay(delay: number, unit: moment.DurationInputArg2 = 'd') {
        const computedMoment = this.startMoment.clone();
        computedMoment.add(1, 'day');
        this.output.push({
            date: computedMoment.format('dddd DD  MMMM YYYY HH:mm'),
            text: 'date de debut réelle (dies ad quo)',
        });

        const endMoment = computedMoment.clone().add(delay, unit);
        endMoment.add(1, 'day');
        let lastMoment;
        let index = 1;
        while (
            endMoment.diff(computedMoment, 'days') > 0 
            || isSaturday(computedMoment) 
            || isSunday(computedMoment) 
            || isHoliday(computedMoment)
        ) {
            const day = computedMoment.add(1, 'day').format('dddd DD  MMMM YYYY HH:mm');
            if(endMoment.diff(computedMoment, 'days') > 0 ){
                this.output.push({
                    date: day,
                    text: 'jour '+index,
                });
                index++;
            }else{
                if(isSaturday(computedMoment)){
                    this.output.push({
                        date: day,
                        text: 'est un samedi',
                    });
                }else if( isSunday(computedMoment)){
                    this.output.push({
                        date: day,
                        text: 'est un dimanche',
                    });
                }else if(isHoliday(computedMoment)){
                    this.output.push({
                        date: day,
                        text: 'est un jour férié',
                    });
                }else{
                    lastMoment = computedMoment.add(23,'hours').add(59,'minutes').add(59,"seconds").format('dddd DD  MMMM YYYY HH:mm'),
                    this.output.push({
                        date: lastMoment,
                        text: 'date de fin au plus tard (dies ad quem)',
                    });
                }
            }
            
        }
        console.log("AttClearDelay -> addClearDelay -> this.output", this.output)
        return lastMoment;
    }
}

// new AttClearDelay('2020-05-04').addClearDelay(15, 'M')
