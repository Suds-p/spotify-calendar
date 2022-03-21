import express from 'express';
import { Buffer } from 'buffer';
import request from 'request';
import cors from 'cors';
import secrets from './secrets.js';
import { resolveNaptr } from 'dns/promises';
const app = express();

app.use(cors({origin: '*'}));

app.get('/', (req, res) => {
  res.send("Oops, nothing to see here. Use /testAlbum or /tracks instead.")
})

app.get('/testAlbum', (req, res) => {
  var albumOptions = {
    url: `https://api.spotify.com/v1/tracks/${song_id}`,
    headers: {'Authorization': 'Bearer ' + token},
    json: true
  };
  request.get(albumOptions, function(error, response, song) {
    console.log(song.album);
    res.send(song.album);
  });
});

// Expects "start" and "end" date parameters both in yyyy-mm-dd format
app.get('/tracks', (req, res) => {
  let { start, end } = req.query;

  // Get song data from Python server
  request.get({
    url: `http://localhost:5000/range-common-tracks?start=${start}&end=${end}`,
    json: true
  }, (error, response, data) => {
    // Create array of promises and resolve all of them before sending
    let track_uris = Object.values(data.track_uri);
    Promise.all(
      track_uris.map(song_id => 
        new Promise((song_res, song_rej) => {
          song_id = song_id.split(":")[2];
          request.get(trackOptions(song_id), (err, res, song) => {
            if (song && song.album) {
              let url = song.album.images[1].url;
              song_res(url);
            } else {
              console.log('Song that came back was');
              console.log(song);
            }
          });
        })
      )
    )
    .then(albumUrls => {
      let keys = Object.keys(data.track_uri);
      data.album_urls = keys.reduce((acc, k, i) => (acc[k] = albumUrls[i], acc), {});
      res.send(data);
    })
    .catch(err => console.log(err));
  });
});

app.listen(5500);

// const body = document.getElementsByTagName('main')[0];
const song_id = '1Qpq65tfyd7NWmIf3gRxEU';
let token = '';
let trackOptions = (song_id) => ({
  url: `https://api.spotify.com/v1/tracks/${song_id}`,
  headers: {'Authorization': 'Bearer ' + token},
  json: true
});

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
  if (error) {
    console.log(`error lul ${error}`);
  }
  if (!error && response.statusCode === 200) {
    // use the access token to access the Spotify Web API
    token = body.access_token;
  }
  else if (response.statusCode >= 400) {
    console.log(body);
  }
});
