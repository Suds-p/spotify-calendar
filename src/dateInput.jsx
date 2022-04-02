import React, { useState, useEffect } from 'react';
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
  let [ hasFiles, setHasFiles ] = useState(false);

  // Derived from https://www.digitalocean.com/community/tutorials/how-to-call-web-apis-with-the-useeffect-hook-in-react
  useEffect(() => {
    let mounted = true;
    checkFilesPresent().then(data => {
      if (mounted) setHasFiles(data.filesPresent);
    })
    return () => mounted = false;
  })

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

  const dateInputBox = (
    <div style={{display: "flex", flexDirection: "column"}}>
      <p><strong>Show my obsessions from</strong></p>
      <DateInput
        startDate={startDate} setStart={setStart}
        endDate={endDate} setEnd={setEnd}
        />
      <button id="submit-date-btn" onClick={changeScreen}>Show me!</button>
    </div>);

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

        {hasFiles ? dateInputBox : <FileInput updateHasFiles={() => setHasFiles(true)} />}

      </div>
    </div>
  );
}

function FileInput(props) {
  const [EMPTY, INVALID, VALID] = ["empty", "invalid", "valid"];
  const nameReg = /(endsong)_(\d|0[1-9]|[1-9]\d).json/gm;
  let { updateHasFiles } = props;
  let [ selectionState, setSelectionState ] = useState(EMPTY);
  let [ errorMessage, setErrorMessage ] = useState("");

  function validateSelection() {
    let fileInput = document.getElementById("song-files");
    let files = Array.from(fileInput.files);
    let names = files.map(f => f.name);
    if (files.length === 0) {
      setSelectionState(INVALID);
      setErrorMessage("No files are selected");
    } else if (! names.every(n => n.match(nameReg))) {
      setSelectionState(INVALID);
      setErrorMessage("File names must have a 'endsong_xx.json' format");
    }
    else {
      setSelectionState(VALID);
      setErrorMessage("");
    }
  }

  function submitFiles() {
    let fileInput = document.getElementById("song-files");
    let files = Array.from(fileInput.files);
    if (selectionState === VALID) uploadFiles(files).then(updateHasFiles).catch(() => console.log("Stopped from reloading page"));
  }

  return (
    <div>
      <input
        multiple
        type="file"
        name="songFiles"
        id="song-files"
        onChange={validateSelection}
        className={selectionState === EMPTY ? "" : "file-input-"+selectionState} />
      <button onClick={submitFiles}>Upload</button>
      {errorMessage !== "" && <span>{errorMessage}</span>} 
    </div>
  );
}

function DateInput(props) {
  let { startDate, setStart, endDate, setEnd } = props;

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
    </div>
  );
}

// Input validation for date inputs (parameters are Date objects)
function validDates(start, end) {
  return (start && end) && start <= end;
}

// Custom date format for input display
function customDateFormat(date) {
  return monthNames[date.getMonth() + 1] + " " + date.getDate() + ", " + date.getFullYear();
}

async function checkFilesPresent() {
  return new Promise((resolve, _) => {
    fetch("http://localhost:5500/filesPresent")
    .then(data => data.json())
    .then(resolve)
  })
}

// Uploads files to custom server via POST requests
async function uploadFiles(files) {
  let shouldStopLoop = false;
  for (let f of files) {
    let data = await getBase64(f);
    let result = await fetchRetry(`http://localhost:5500/uploadFile?filename=${f.name}`, {
      method: 'POST',
      body: data
    }, 5)
    .catch(() => {shouldStopLoop = true});
    console.log(result);
    if (shouldStopLoop) break;
  }
}

async function getBase64(file) {
  return new Promise((res, rej) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      res(reader.result);
    };
  })
}

// Taken from https://dev.to/ycmjason/javascript-fetch-retry-upon-failure-3p6g
function fetchRetry(url, options, n) {
  return new Promise((resolve, reject) => {
    fetch(url, options)
    .then(resolve)
    .catch((error) => {
      if (n === 1) return reject(error);
      setTimeout(() => {
        fetchRetry(url, options, n-1)
        .then(resolve)
        .catch(reject);
      }, 200);
    })
  })
}

export default DateInputScreen;