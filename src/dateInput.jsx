import React, { useState } from 'react';
import { monthNamesOnly } from './calendar';

export default function DateInput(props) {
  let { updateHasDate } = props;
  let [ startDate, setStart ] = useState(new Date());
  let [ endDate, setEnd ] = useState(new Date());

  // Input validation for date inputs (parameters are Date objects)
  function validateDates(start, end) {
    return (start && end) && start <= end;
  }

  function updateDates() {
    if (validateDates(startDate, endDate)) {
      console.log(startDate, endDate);
      updateHasDate([startDate, endDate]);
    } else {
      console.log(`Date range is not valid! From ${startDate} to ${endDate}.`);
    }
  }

  function handleStartMonthChange(event) {
    let monthValue = event.target.value;
    console.log('trig');
    let monthIndex = monthNamesOnly.indexOf(monthValue);
    if (monthIndex !== -1) {
      let tempDate = new Date(startDate);
      tempDate.setMonth(monthIndex);
      setStart(tempDate);
    }
  }

  function handleStartYearChange(event) {
    let yearValue = event.target.value;
    console.log('gered');
    if (2008 <= yearValue && yearValue <= new Date().getFullYear()) {
      let tempDate = new Date(startDate);
      tempDate.setFullYear(yearValue);
      setStart(tempDate);
    }
  }

  function handleEndMonthChange(event) {
    let monthValue = event.target.value;
    console.log('dont');
    let monthIndex = monthNamesOnly.indexOf(monthValue);
    if (monthIndex !== -1) {
      let tempDate = new Date(endDate);
      tempDate.setMonth(monthIndex);
      setEnd(tempDate);
    }
  }

  function handleEndYearChange(event) {
    let yearValue = event.target.value;
    console.log('hug me im scared');
    if (2008 <= yearValue && yearValue <= new Date().getFullYear()) {
      let tempDate = new Date(endDate);
      tempDate.setFullYear(yearValue);
      setEnd(tempDate);
    }
  }

  return (
    <div className="date-input-wrapper">
      <div className="date-input interactable">
        <div className="row"><h3>See history from</h3></div>
        <div className="row">
          <MonthListInput name="start-month" id="sm" onChange={handleStartMonthChange} />
          <span className="bar">|</span>
          <YearListInput name="start-year" id="sy" onChange={handleStartYearChange} />
        </div>
        <div className="row"><h3>to</h3></div>
        <div className="row">
          <MonthListInput name="end-month" id="em" onChange={handleEndMonthChange} />
          <span className="bar">|</span>
          <YearListInput name="end-year" id="ey" onChange={handleEndYearChange} />
        </div>
      </div>
      <button className="bold-btn" onClick={updateDates} >Explore your obsessions</button>
    </div>
  );
}

function MonthListInput(props) {
  let { name, id, onChange } = props;

  return (
    <div className="dropdown-text-input">
      <input list={id} name={name} placeholder={monthNamesOnly[0]} onChange={onChange} />
      <datalist id={id}>
        {
          monthNamesOnly.map(m => <option value={m} key={m} />)
        }
      </datalist>
    </div>
  );
}

function YearListInput(props) {
  let { name, id, onChange } = props;
  let currentYear = new Date().getFullYear();
  let years = [];
  for (let y = 2008; y <= currentYear; y++) years.push(y);

  return (
    <div className="dropdown-text-input">
      <input list={id} name={name} placeholder={currentYear} onChange={onChange} />
      <datalist id={id}>
      {
        years.map(y => <option value={y} key={y} />)
      }
      </datalist>
    </div>
  );
}