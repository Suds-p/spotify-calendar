import React from 'react';

const monthNames = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * View for an entire calendar month with cells for each date.
 * 
 * @param props: should have {year, month} as strings and viewData as song data object.
 */
let MonthView = (props) => {
  const { year, month, viewData } = props;
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
            week.map((date, j) => {
              let key = `${year}-${month}-${date}`
              return <MonthCell
                dateString={key}
                isSpacer={date == 0}
                viewData={viewData && viewData[key]}
                key={j}/>
            })
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
 * Example viewData is {
 *  "2017-04-01": {
 *    "song": "100 Bad Days",
 *    "artist": "AJR",
 *    "count": 128,
 *    "track_uri": "3473495734",
 *    "album_url": "https://image-url.com/path-to-image.png"
 *  },
 *  "2017-04-02": {...song data...},
 * }
 */
let MonthCell = (props) => {
  const { dateString, isSpacer, viewData } = props;
  const cellClass = isSpacer ? "spacer" : "date";

  const imgSrc  = isSpacer ? "" :
    (viewData && viewData.album_url) ? viewData.album_url :
    "../public/assets/no-song.png"

  return (
    <div id={dateString} className={"slot " + cellClass}>
      {isSpacer ? "" : dateString.split('-')[2]}
      <img src={imgSrc}/>
    </div>
  );
}

export default MonthView;