import React from 'react';

const monthNames = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * View for an entire calendar month with cells for each date.
 * 
 * @param props: should have {year, month} as strings.
 */
let MonthView = (props) => {
  const { year, month } = props;
  let d = new Date(year, month, 0);
  let days = d.getDate();

  // Add initial spaces to line up weeks
  d.setDate(1);
  let ns = [...Array(d.getDay()).fill(0), ...Array(days+1).keys()];
  ns.shift();

  // Contains dates organized in weeks, each week is an array
  let week_groups = [];
  while (ns.length > 0) {
    week_groups.push(ns.splice(0, 7));
  }

  return (
    <div className="monthContainer">
      <MonthHeader year={year} month={month}/>
      <div className="dateCells">{
        week_groups.map((week, i) => (
          <div className="row" key={i}>{
            week.map((date, j) => 
              <MonthCell dateString={`${year}-${month}-${date}`} isSpacer={date == 0} key={j}/>
            )
          }</div>)
        )
      }</div>
    </div>
  );
}

/**
 * Simple header for a month view. Contains full month name and year.
 * 
 * @param props: should have {year, month} as strings.
 */
let MonthHeader = (props) => {
  return <h2>{monthNames[+props.month]} {props.year}</h2>;
}

/**
 * View for a single date cell in a month view
 * 
 * @param props: should have { dateString, isSpacer } as a string and boolean.
 * Example of dateString is "2021-06".
 */
let MonthCell = (props) => {
  const { dateString, isSpacer } = props;
  const cellClass = isSpacer ? "spacer" : "date";

  return (
    <div id={dateString} className={"slot " + cellClass}>
      {isSpacer ? "" : dateString.split('-')[2]}
      <img src={isSpacer ? "" : "https://place-hold.it/100"}/>
    </div>
  );
}

export default MonthView;