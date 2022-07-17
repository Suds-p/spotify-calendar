import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

/**
 * Subview for letting users pick data files from their system.
*/
export default function FileInput(props) {
  // State names for styling
  const [EMPTY, INVALID, VALID, FILES_DROPPED, FILES_UPLOADING, FILES_UPLOADED] =
   ["upload-empty", "upload-invalid", "upload-valid", "files-unloaded", "files-uploading", "files-uploaded"];
  const nameReg = /(endsong)_(\d|0[1-9]|[1-9]\d).json/gm;
  let { updateHasFiles } = props;
  let [ uploadState, setUploadState ] = useState(EMPTY);
  let [ errorMessage, setErrorMessage ] = useState("");
  let [ isInputDisabled, setInputDisabled ] = useState(false);
  let [ files, setFiles ] = useState([]);
  let [ buttonTitle, setButtonTitle ] = useState("Submit Files");

  function validateSelection(files) {
    let names = files.map(f => f.name);
    if (files.length === 0) {
      setErrorMessage("No files are selected");
      return false;
    } else if (! names.every(n => n.match(nameReg))) {
      setErrorMessage("File names must have a 'endsong_xx.json' format");
      return false;
    }
    else {
      setErrorMessage("");
      return true;
    }
  }

  function submitFiles() {
    if (uploadState === FILES_DROPPED) {
      setButtonTitle("Loading . . .");
      setUploadState(FILES_UPLOADING);
      uploadFiles(files)
      // TODO: add extra step that says "Processing" on button
      // TODO: add extra step that calls backend to create dataframes
      .then(() => {
        setButtonTitle("Processing...");
        return fetch(`${BACKEND_URL}/process-data`, { method: 'POST' });
      })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setButtonTitle("Done! Let's check your history >");
          setUploadState(FILES_UPLOADED);
        } else {
          throw 'Did not get a response back';
        }
      })
      .catch(() => {
        setButtonTitle("Server is probably offline :(");
        setUploadState(FILES_DROPPED);
      });
    }
  }

  /**** Event Handlers ****/
  let onDrop = (event) => {
    event.preventDefault();
    let receivedFiles = Array.from(event.dataTransfer.files);
    let isValid = validateSelection(receivedFiles);
    if (isValid) {
      // Disable input field
      setInputDisabled(true);
      setUploadState(FILES_DROPPED);
      setFiles(receivedFiles);
    } else {
      setUploadState(INVALID);
    }
  };

  let onDragOver = (event) => {
    event.preventDefault();
    let isValid = validateSelection(Array.from(event.dataTransfer.files));

    if (isValid) {
      setUploadState(VALID);
    } else {
      setUploadState(INVALID);
    }
  };

  let onDragLeave = (event) => {
    event.preventDefault();
    setUploadState(EMPTY);
  }

  /**** Upload states ****/
  let fileEmpty = (
    <div className={"content " + EMPTY}>
      <div className="file-icons">
        <img src="../images/doc-symbol.png" />
        <img src="../images/doc-symbol.png" />
        <img src="../images/doc-symbol.png" />
      </div>
      <div className="upload-text">
        <h2>Drag and drop data files here</h2>
        <a href="#"><sub>Not sure where to find your files?</sub></a>
      </div>
    </div>);
  
  let fileDragValid = (
    <div className={"content " + VALID}>
      <div className="upload-text">
        <h2>Drop data files in</h2>
      </div>
    </div>);

  let fileDragInvalid = (
    <div className={"content " + INVALID}>
      <div className="upload-text">
        <h2>{errorMessage}</h2>
      </div>
    </div>);

  let filesReceived = <UploadView files={files} currentState={uploadState} />

  return (
    <div
      className="file-upload-wrapper"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}>
      <div className="file-upload interactable">
        <input
          multiple
          type="file"
          name="songFiles"
          id="song-files"
          disabled={isInputDisabled}
          onChange={validateSelection}
          className={uploadState === EMPTY ? "" : "file-input-"+uploadState} />

        {
          uploadState == EMPTY ? fileEmpty :
          uploadState == VALID ? fileDragValid :
          uploadState == INVALID ? fileDragInvalid :
          filesReceived
        }
      </div>

      <button
        className="bold-btn"
        onClick={uploadState === FILES_UPLOADED ? updateHasFiles : submitFiles}>
          {buttonTitle}
      </button>
    </div>
  );
}

function UploadView(props) {
  let {files, currentState} = props;
  let names = files.map(f => f.name);
  return (
    <div className="received-file-list">
      {names.map((n, i) =>
        <span
          className={"file " + currentState}
          key={"file-" + i}>{n}</span>)}
    </div>
  );
}

// Uploads files to custom server via POST requests
async function uploadFiles(files) {
  for (let f of files) {
    await fetchRetry(`${BACKEND_URL}/data-file?filename=${f.name}`, {
      method: 'POST',
      body: await getBase64(f)
    }, 5)
  }
}

// Returns binary data of given file name as a base64 string
async function getBase64(file) {
  return new Promise((resolve, _) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
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