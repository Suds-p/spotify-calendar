import React, { useState } from 'react';
import Header from './header';
import CalendarScreen from "./calendar";
import DateInputScreen from './home';

export const CALENDAR = "calendar";
export const DATE_INPUT = "date_input";

const INITIAL_STATE = {
  screen: DATE_INPUT,
  startYear: 0,
  startMonth: 0,
  endYear: 0,
  endMonth: 0
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  let {screen, startYear, startMonth, endYear, endMonth} = state;

  return (
    <div>
      <Header />
      {
        (screen === CALENDAR) ?
          <CalendarScreen
            startYear={startYear}
            startMonth={startMonth}
            endYear={endYear}
            endMonth={endMonth}
            setState={setState} /> :
        (screen === DATE_INPUT) && <DateInputScreen setState={setState} />
      }
    </div>
  );
}