import express from 'express';
import { Buffer } from 'buffer';
import request from 'request';
import cors from 'cors';
import secrets from './secrets.js';
import fs from 'fs';
import bp from 'body-parser';

const DATA_PATH = "data-processing/data/";
let token = '';
let trackOptions = (trackURIs) => ({
  url: `https://api.spotify.com/v1/tracks?ids=${trackURIs.join(",")}`,
  headers: {'Authorization': 'Bearer ' + token},
  json: true
});

const app = express();
app.use(cors({origin: '*'}));
app.use(bp.raw({ limit: "15mb", type: ["text/*", "application/octet-stream"] }));

app.get('/', (req, res) => {
  res.send("Oops, nothing to see here. Use /testAlbum or /tracks instead.")
})

// Expects "start" and "end" date parameters both in yyyy-mm-dd format
// Example response structure:
/*
  {
    "2017-04-01": {
      song: "100 Bad Days",
      artist: "AJR",
      album: "Neotheater",
      album_url: "https://....",
      track_uri: "57382479847",
      count: 42
    },
    "2017-04-02": {
      song: "Forever Winter",
      artist: "Taylor Swift",
      album: "Red (Taylor's Version)",
      album_url: "https://...",
      track_uri: "48579238419",
      count: 170
    },
    ...
  }
*/
app.get('/tracks', (req, res) => {
  let { start, end } = req.query;

  // Get song data from Python server
  request.get({
    url: `http://localhost:5000/range-common-tracks?start=${start}&end=${end}`,
    json: true
  }, (error, response, data) => {
    if (error || response.statusCode >= 400) {
      res.status(400).json({message: "Failed to communicate with backend", error}) ;
      return;
    }
    // Create array of promises for album URLs and resolve all of them before sending
    let keys = Object.keys(data);
    let trackURIs = keys.map(k => data[k].track_uri);
    if (trackURIs.length === 0) return res.send({});

    request.get(trackOptions(trackURIs), (songErr, songRes, songData) => {
      if (songErr || songRes.statusCode >= 400) {
        console.log(songData)
        res.status(400).json({message: "Could not connect to Spotify API", error: songErr});
        return;
      }

      let albumUrls = songData.tracks.map(d => d.album.images[1].url);
      keys.map((k, i) => data[k].album_url = albumUrls[i]);
      res.send(data);
    })
  });
});

app.post('/uploadFile', (req, res) => {
  if (! req.body || ! req.query.filename) return res.status(400).send("File content or name was missing")
  fs.createWriteStream(DATA_PATH + req.query.filename).write(req.body);
  res.send("File successfully uploaded");
})

app.get('/filesPresent', (_, res) => {
  request.get({
    url: "http://localhost:5000/files-present",
    json: true
  }, (error, response, data) => {
    if (error || response.statusCode >= 400) {
      return res.status(400).json({message: "Failed to communicate with backend", error});
    }
    res.send(data);
  })
})

let {client_id, client_secret} = secrets;
const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
}
request.post(authOptions, function(error, response, body) {
  if (error) return console.log(`Could not authenticate: ${error}`);
  if (response.statusCode >= 400) return console.log(body);
  if (!error && response.statusCode === 200) {
    // use the access token to access the Spotify Web API
    token = body.access_token;
  }
});

app.listen(5500);