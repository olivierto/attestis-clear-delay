import * as moment from 'moment';
import * as Holidays from 'date-holidays';

/**
 * the function will compute the end date in clear delay ('jour francs')
 * @param startDate the starting date
 * @param delay the delay (in days by default)
 * @param unit the delay unit (days by default)
 * @param debug if true will display debug log message
 */
export const addClearDelay = async (
  startDate: Date,
  delay: number,
  unit: moment.DurationInputArg2 = 'd',
  debug = false
) => {
  //configure moment
  moment.updateLocale('fr', {
    week: {
      dow: 1, // First day of week is Monday
      doy: 4, // First week of year must contain 1 January (7 + 0 - 1)
    },
  });
  // moment.relativeTimeRounding(Math.floor);
  const startMoment = moment(startDate);
  if (debug) {
    console.log('date de debut', startMoment.format('DD dddd  MMMM YYYY'));
  }
  // do not take the first day (dies ad quo)
  startMoment.add(1, 'day');
  //Add the delay
  const endMoment = startMoment.add(delay, unit);

  //do not take the last day (dies ad quem)
  endMoment.add(1, 'day');

  let endDateIsInvalid =
    isSaturday(endMoment, debug) ||
    isSunday(endMoment, debug) ||
    isHoliday(endMoment, debug);
  let index = 1;
  while (endDateIsInvalid) {
    if (debug) console.log('day number', index);
    endMoment.add(1, 'd');
    endDateIsInvalid =
      isSaturday(endMoment, debug) ||
      isSunday(endMoment, debug) ||
      isHoliday(endMoment, debug);
    index++;
  }
  if (debug) {
    console.log(
      'date de fin (au plus tôt):',
      endMoment.format('dddd DD  MMMM YYYY'),
      ' à partir de 00h00'
    );
  }
  return endMoment.toDate();
};

/**
 * the function will compute the start for a given period in clear delay ('jour francs')
 * @param endDate the end date
 * @param delay the delay (in days by default)
 * @param unit the delay unit (days by default)
 * @param debug if true will display debug log message
 */
export const subtractClearDelay = async (
  endDate: Date,
  delay: number,
  unit: moment.DurationInputArg2 = 'd',
  debug = false
) => {
  //configure moment
  moment.updateLocale('fr', {
    week: {
      dow: 1, // First day of week is Monday
      doy: 4, // First week of year must contain 1 January (7 + 0 - 1)
    },
  });
  const _endMoment = moment(endDate);
  if (debug) {
    console.log(
      'de fin (au plus tôt)',
      _endMoment.format('DD dddd  MMMM YYYY')
    );
  }
  // do not take the last day (dies ad quem)
  _endMoment.subtract(1, 'day');
  //Add the delay
  const startMoment = _endMoment.subtract(delay, unit);

  //do not take  the first day (dies ad quo)
  startMoment.subtract(1, 'day');

  let startDateIsInvalid =
    isSaturday(startMoment, debug) ||
    isSunday(startMoment, debug) ||
    isHoliday(startMoment, debug);
  let index = 1;
  while (startDateIsInvalid) {
    if (debug) console.log('day number', index);
    startMoment.subtract(1, 'd');
    startDateIsInvalid =
      isSaturday(startMoment, debug) ||
      isSunday(startMoment, debug) ||
      isHoliday(startMoment, debug);
    index++;
  }
  if (debug) {
    console.log(
      'date de début (au plus tard):',
      startMoment.format('dddd DD  MMMM YYYY')
    );
  }
  return startMoment.toDate();
};

export const isSaturday = (_moment: moment.Moment, debug = false) => {
  const isSaturday = _moment.weekday() === 5;
  if (debug && isSaturday) {
    console.log(_moment.format('dddd  DD MMMM YYYY'), ' is saturday');
  }
  return isSaturday;
};
export const isSunday = (_moment: moment.Moment, debug = false) => {
  const isSunday = _moment.weekday() === 6;
  if (debug && isSunday) {
    console.log(_moment.format('dddd  DD MMMM YYYY'), ' is sunday');
  }
  return isSunday;
};

export const isHoliday = (_moment: moment.Moment, debug = false) => {
  const hd = new Holidays('FR', { types: ['public'] });
  hd.setLanguages('fr');
  const holiday = hd.isHoliday(_moment.toDate());
  const isHoliday = holiday ? true : false;
  if (debug && isHoliday) {
    console.log(
      _moment.format('dddd  DD MMMM YYYY'),
      ' is Holiday',
      (holiday as Holidays.Holiday).name
    );
  }
  return isHoliday;
};
