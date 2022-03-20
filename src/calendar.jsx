import React from 'react';
import MonthView from './month';

/**
 * View for multiple months in a given range.
 * 
 * @param props: should have {startYear, startMonth, endYear, endMonth} as numbers.
 */
let CalendarScreen = (props) => {
  let { startYear, startMonth, endYear, endMonth } = props;
  const mRange = getMonthRange(startYear, startMonth, endYear, endMonth);

  return (
    <main>
      {mRange.map(dateInfo => <MonthView year={dateInfo[0]} month={dateInfo[1]} key={dateInfo[1]}/>)}
    </main>
  );
};

/**
 * Returns an array of arrays, each containing a year and month as strings,
 * covering the range between the two dates.
 * Months are always padded to two digits.
 */
 function getMonthRange(y1, m1, y2, m2) {
  let range = [[y1.toString(), m1.toString().padStart(2, "0")]];
  while (y1 !== y2 || m1 !== m2) {
    m1 = (m1 === 12) ? 1 : (m1 + 1);
    y1 = (m1 === 1) ? (y1 + 1) : y1;
    range.push([y1.toString(), m1.toString().padStart(2, "0")]);
  }
  return range;
}

export default CalendarScreen;