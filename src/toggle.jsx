import React from 'react';

export default function Toggle(props) {
  let { option1, option2, onChangeValue } = props;

  // Send first or second option depending on whether internal checkbox is "checked"
  function processChange(event) {
    onChangeValue(event.target.checked ? option1 : option2);
  }

  let toggleCSS = `
    .toggle-btn input:before {
      content: "${option1}";
    }
    
    .toggle-btn input:after {
      content: "${option2}";
    }
  `;
  return (
    <>
    <style>{toggleCSS}</style>

    <span className="toggle-btn">
      <input type="checkbox" id="switch" onChange={processChange} />
      <label htmlFor="switch"></label>
    </span>
    </>
  );
}