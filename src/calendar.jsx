import React from 'react';
import MonthView from './month';

// Example state structure:
/*
 {
   "2017-04": {
     "2017-04-01": {...song data...},
     "2017-04-02": {...song data...},
     "2017-04-03": {...song data...},
     ...
     "2017-04-30": {...song data...},
   },
   ...
   "2017-08": {
     "2017-08-01": {...song data...},
     "2017-08-02": {...song data...},
     "2017-08-03": {...song data...},
     ...
     "2017-08-30": {...song data...},
   },
  }
*/

/**
 * View for multiple months in a given range.
 * 
 * @param props: should have {startYear, startMonth, endYear, endMonth} as numbers.
 */
class CalendarScreen extends React.Component{
  constructor(props) {
    super(props);
    let { startYear, startMonth, endYear, endMonth } = this.props;
    this.mRange = getMonthRange(startYear, startMonth, endYear, endMonth);
    this.state = {};
  }

  componentDidMount() {
    let tempState = {};
    this.mRange.map(x => tempState[x[0]+"-"+x[1]] = {} );
    let keys = Object.keys(tempState);
    Promise.all(
      this.mRange.map(info => {
        let [date1, date2] = [`${info[0]}-${info[1]}-01`, `${info[0]}-${info[1]}-31`];
        return new Promise((res, rej) => {
          fetch(`http://localhost:5500/tracks?start=${date1}&end=${date2}`)
          .then(resp => resp.json())
          .then(data => res(data))
        });
      })
    )
    .then(results => {
      keys.map((k, i) => tempState[k] = results[i]);
      console.log(tempState);
      this.setState(tempState);
    });
  }
  
  // Set up initial objects for each month in range
  render() {
    return (
      <main>
       {this.mRange.map(info => 
          <MonthView 
            year={info[0]}
            month={info[1]}
            key={info[1]}
            viewData={this.state[info[0]+'-'+info[1]]} />)}
      </main>
    );
  }
};

/**
 * Returns an array of arrays, each containing a year and month as strings,
 * covering the range between the two dates.
 * Months are always padded to two digits.
 * 
 * Example:
 * getMonthRange(2017, 4, 2017, 8) -> [["2017", "04"], ["2017", "05"], ..., ["2017", "08"]]
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