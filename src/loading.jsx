import React from 'react';

export default Loader = () => {
  return (
    <div className='screen-container'>
      <h1 style={{marginBottom: 20, color: "white"}}>Loading . . .</h1>
      <div className="loading-center">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
}