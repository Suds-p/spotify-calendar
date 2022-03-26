import React, { useState } from 'react';
import DayPicker from 'react-day-picker'
import DPI from 'react-day-picker/DayPickerInput'
import 'react-day-picker/lib/style.css';
import { CALENDAR } from './app';
import { monthNames } from './calendar';
const DayPickerInput = DPI.__esModule ? DPI.default : DPI

// Derived from https://react-day-picker.js.org/examples/elements-year-navigation
function YearMonthForm({ date, localeUtils, onChange }) {
  const months = localeUtils.getMonths();

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 2017; i <= currentYear; i += 1) {
    years.push(i);
  }

  const handleChange = function handleChange(e) {
    const { year, month } = e.target.form;
    onChange(new Date(year.value, month.value));
  };

  return (
    <form className="DayPicker-Caption">
      <select name="month" onChange={handleChange} value={date.getMonth()}>
        {months.map((month, i) => (
          <option key={month} value={i}> {month} </option>
        ))}
      </select>
      <select name="year" onChange={handleChange} value={date.getFullYear()}>
        {years.map(year => (
          <option key={year} value={year}> {year} </option>
        ))}
      </select>
    </form>
  );
}

/**
 * View for initial screen where user enters
 * start and end dates for the full range of
 * months they'd like to see.
 * 
 * @param props: should have { setState } which changes the current screen.
 */
let DateInputScreen = (props) => {
  const { setState } = props;
  let [ startDate, setStart ] = useState(new Date());
  let [ endDate, setEnd ] = useState(new Date());

  function changeScreen() {
    if (validDates(startDate, endDate)) {
      setState({
        screen: CALENDAR,
        startYear: startDate.getFullYear(),
        startMonth: startDate.getMonth() + 1,
        endYear: endDate.getFullYear(),
        endMonth: endDate.getMonth() + 1
      });
    } else {
      console.log(`Date range is not valid! From ${startDate} to ${endDate}.`);
    }
  }

  function handleStartYMChange(date) {
    // Take on existing day when month changes
    date.setDate(startDate.getDate());
    setStart(date);
  }

  function handleEndYMChange(date) {
    // Take on existing day when month changes
    date.setDate(endDate.getDate());
    setEnd(date);
  }

  return (
    <div className="di-container">
      <div className="input-field-container">

        <div className="info">
          <div className="lg-col">
            <p className="hook-text">
              Explore your <br />
              Spotify <span className="hook-emphasis">obsessions</span>.
            </p>
            <p className="subtitle">
              You may have a clinical addiction to playing music or just like 
              checking out some popular bangers every once in a while. Whatever your
              listening patterns, find out what or who you were into in the past.
            </p>
          </div>
          <div className="sm-col">
            <div className="info">
              <p>You've been listening since</p>
              <p className="listen-start-info">
                Mar 2017
              </p>
            </div>
          </div>
        </div>
        
        <div style={{display: "flex", flexDirection: "column"}}>
          <p><strong>Show my obsessions from</strong></p>
          <div className="input-container-row">
            <div className="input-row">
              <DayPickerInput
                formatDate={customDateFormat}
                value={startDate}
                onDayChange={setStart}
                dayPickerProps={{month: startDate, captionElement: ({ date, localeUtils }) => (
                  <YearMonthForm
                    date={date}
                    localeUtils={localeUtils}
                    onChange={handleStartYMChange}
                  />)}} />
            </div>
            <p><strong>to</strong></p>
            <div className="input-row">
              <DayPickerInput
                formatDate={customDateFormat}
                value={endDate}
                onDayChange={setEnd}
                dayPickerProps={{month: endDate, captionElement: ({ date, localeUtils }) => (
                  <YearMonthForm
                    date={date}
                    localeUtils={localeUtils}
                    onChange={handleEndYMChange}
                  />)}} />
            </div>
            <button id="submit-date-btn" onClick={changeScreen}>Show me!</button>
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="di-container">
  //     <div className="row">
  //       <div className="col">
  //         <span>start month</span>
  //         <input id="sm" type="text" placeholder="10"/>
  //       </div>
  //       <div className="col">
  //         <span>start year</span>
  //         <input id="sy" type="text" placeholder="2021"/>
  //       </div>
  //     </div>
  //     <div className="row">
  //       <div className="col">
  //         <span>end month</span>
  //         <input id="em" type="text" placeholder="02" />
  //       </div>
  //       <div className="col">
  //         <span>end year</span>
  //         <input id="ey" type="text" placeholder="2022"/>
  //       </div>
  //     </div>
  //     <button id="submit-date-btn" onClick={changeScreen}>Show me!</button>
  //   </div>
  // );
}

// Input validation for date inputs (parameters are Date objects)
function validDates(start, end) {
  return (start && end) && start <= end;
}

// Custom date format for input display
function customDateFormat(date) {
  return monthNames[date.getMonth() + 1] + " " + date.getDate() + ", " + date.getFullYear();
}

export default DateInputScreen;