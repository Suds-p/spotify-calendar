import React from 'react';
import { CALENDAR } from './app';

/**
 * View for initial screen where user enters
 * start and end dates for the full range of
 * months they'd like to see.
 * 
 * @param props: should have { setState } which changes the current screen.
 */
let DateInputScreen = (props) => {
  const { setState } = props;

  function changeScreen() {
    const sy = document.getElementById('sy').value;
    const sm = document.getElementById('sm').value;
    const ey = document.getElementById('ey').value;
    const em = document.getElementById('em').value;

    if (validDates(+sy, +sm, +ey, +em)) {
      setState({
        screen: CALENDAR,
        startYear: +sy,
        startMonth: +sm,
        endYear: +ey,
        endMonth: +em
      });
    } else {
      console.log(`Date range is not valid! From (${sy}, ${sm}) to (${ey}, ${em})`);
    }
  }

  return (
    <div className="di-container">
      <div className="row">
        <div className="col">
          <span>start month</span>
          <input id="sm" type="text" placeholder="10"/>
        </div>
        <div className="col">
          <span>start year</span>
          <input id="sy" type="text" placeholder="2021"/>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <span>end month</span>
          <input id="em" type="text" placeholder="02" />
        </div>
        <div className="col">
          <span>end year</span>
          <input id="ey" type="text" placeholder="2022"/>
        </div>
      </div>
      <button id="submit-date-btn" onClick={changeScreen}>Show me!</button>
    </div>
  );
}

// Input validation for date inputs (parameters are integers)
function validDates(sy, sm, ey, em) {
  return (sy && sm && ey && em !== 0) && ((sy < ey) || (sy === ey && sm <= em));
}

export default DateInputScreen;