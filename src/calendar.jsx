import React from 'react';
import MonthView from './month';
import Loader from './loading';
import OfflineScreen from './offline';
import { HOME } from './app'
import Toggle from './toggle';

export const monthNamesAtIndex = ["", "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];
export const monthNamesOnly = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];

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
    this.state = {
      loading: false,
      offline: true,
      viewData: {},
      songData: {},
      artistData: {}
    };

    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onChangeValue(value) {
    switch (value) {
      case SONGS:
        this.setState({viewData: this.state.songData}); break;
      case ARTISTS:
        this.setState({viewData: this.state.artistData}); break;
    }
  }

  async componentDidMount() {
    let tempState = {};
    this.mRange.map(x => tempState[x[0]+"-"+x[1]] = {} );
    let keys = Object.keys(tempState);
    this.setState({ loading: true });
    
    await Promise.all(
      this.mRange.map(info => {
        let [date1, date2] = [`${info[0]}-${info[1]}-01`, `${info[0]}-${info[1]}-31`];
        return new Promise((res, rej) => {
          fetch(`http://localhost:5000/tracks?start=${date1}&end=${date2}`)
          .then(resp => resp.json())
          .then(data => res(data))
          .catch(err => rej(`Server is likely offline: ${err}`))
        });
      })
    )
    .then(results => {
      keys.map((k, i) => tempState[k] = results[i]);
      this.setState({loading: false, offline: false, viewData: tempState, songData: tempState});
    })
    .catch(_ => {
      this.setState({loading: false, offline: true});
    });

    tempState = {};

    await Promise.all(
      this.mRange.map(info => {
        let [date1, date2] = [`${info[0]}-${info[1]}-01`, `${info[0]}-${info[1]}-31`];
        return new Promise((res, rej) => {
          fetch(`http://localhost:5000/artists?start=${date1}&end=${date2}`)
          .then(resp => resp.json())
          .then(data => res(data))
          .catch(err => rej(`Server is likely offline: ${err}`))
        });
      })
    )
    .then(results => {
      keys.map((k, i) => tempState[k] = results[i]);
      this.setState({loading: false, offline: false, artistData: tempState});
    })
    .catch(_ => {
      this.setState({loading: false, offline: true});
    });
  }

  // Set up initial objects for each month in range
  render() {
    const backButton = (<button
      className="bold-btn"
      style={{width: "fit-content"}}
      onClick={() => this.props.setState({screen: HOME})}>&#171; Go back</button>);

    return this.state.loading ? <Loader /> : (
      <main style={{display: "flex", flexDirection: "column", padding: "10px"}}>
        <div style={{display: "flex", marginTop: 15}}>
          {backButton}
          <div style={{flexGrow: 1, display: "flex", justifyContent: "center"}}>
            <Toggle option1={SONGS} option2={ARTISTS} onChangeValue={this.onChangeValue} />
          </div>
        </div>
        <div id="calendarScreen">
          {this.mRange.map(info => 
            <MonthView 
              year={info[0]}
              month={info[1]}
              key={info[0]+'-'+info[1]}
              viewData={this.state.viewData[info[0]+'-'+info[1]]} />)}
        </div>
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