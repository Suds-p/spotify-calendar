import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

ReactDOM.render(<React.StrictMode><App /></React.StrictMode>, document.getElementById('root'));

// Not sure where to put this yet...

// fetch(`http://localhost:5000/tracks/2021-06`)
// .then(res => res.json())
// .then(urls => { /* TODO: add code here later */ })
// .catch(err => {
//   console.log("* something went very wrong *");
//   console.log(err);
// });