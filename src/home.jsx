import React, { useState, useEffect } from 'react';
import { CALENDAR } from './app';
import FileInput from './fileInput';
import DateInput from './dateInput';

const BACKEND_URL = 'http://localhost:5000';

/**
 * View for initial screen where user enters
 * start and end dates for the full range of
 * months they'd like to see.
 * 
 * @param props: should have { setState } which changes the current screen.
 */
let DateInputScreen = (props) => {
  const { setState } = props;
  let [ hasFiles, setHasFiles ] = useState(false);
  let [ userStartDate, setUserStartDate ] = useState("");

  // Derived from https://www.digitalocean.com/community/tutorials/how-to-call-web-apis-with-the-useeffect-hook-in-react
  useEffect(() => {
    let mounted = true;
    checkFilesPresent().then(data => {
      if (mounted) setHasFiles(data.filesPresent);
    })
    getUserStartDate().then(data => {
      if (mounted) setUserStartDate(data.startDate);
    })
    return () => mounted = false;
  })

  function changeScreen([startDate, endDate]) {
    setState({
      screen: CALENDAR,
      startYear: startDate.getFullYear(),
      startMonth: startDate.getMonth() + 1,
      endYear: endDate.getFullYear(),
      endMonth: endDate.getMonth() + 1
    });
  }

  // TODO: Add in listening start date to view
  // const startDateFormatted = monthYear(userStartDate);

  return (
    <div className="home-container">
      <section className="col home-text">
        <h1>Explore your<br />Spotify <span>obsessions</span>.</h1>
        <p>
        Are you someone that can't get enough of that one song or artist and go through 
        long phases where you listen to nothing else? Curious how your music tastes have 
        changed over the years? 
        <br />
        <br />
        Look no further! Upload your Spotify listening history files here and see your 
        playing history come to file. Find out which songs or artists you've listened to 
        the most over the years.
        </p>
      </section>

      <section className="col">
        {
          hasFiles ?
            <DateInput updateHasDate={changeScreen} /> :
            <FileInput updateHasFiles={() => setHasFiles(true)} />
        }
      </section>
    </div>
  );
}

async function checkFilesPresent() {
  return new Promise((resolve, _) => {
    fetch("http://localhost:5000/files-present")
    .then(data => data.json())
    .then(resolve)
  })
}

async function getUserStartDate() {
  return new Promise((resolve, _) => {
    fetch(`${BACKEND_URL}/start-date`)
    .then(data => data.json())
    .then(resolve)
  })
}

export default DateInputScreen;