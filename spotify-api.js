import express from 'express';
import { Buffer } from 'buffer';
import request from 'request';
import cors from 'cors';
import secrets from './secrets.js';

let token = '';
let trackOptions = (song_id) => ({
  url: `https://api.spotify.com/v1/tracks/${song_id}`,
  headers: {'Authorization': 'Bearer ' + token},
  json: true
});
let urlCache = {};

const app = express();
app.use(cors({origin: '*'}));

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
    // Create array of promises and resolve all of them before sending
    let keys = Object.keys(data);
    let track_uris = keys.map(k => data[k].track_uri);
    Promise.all(
      track_uris.map((song_id, i) => 
        new Promise((song_res, song_rej) => {
          song_id = song_id.split(":")[2];
          let urlId = data[keys[i]].artist + data[keys[i]].album;
          if (urlCache[urlId]) {
            console.log("used cache");
            song_res(urlCache[urlId]);
          } else {
            request.get(trackOptions(song_id), (err, res, song) => {
              if (song && song.album) {
                let url = song.album.images[1].url;
                urlCache[urlId] = url;
                song_res(url);
              } else {
                song_rej({error: err, song: song});
              }
            });
          }
        })
      )
    )
    .then(albumUrls => {
      keys.map((k, i) => data[k].album_url = albumUrls[i]);
      res.send(data);
    })
    .catch(err => {
      console.log("Fetching tracks in range failed:");
      console.log(err)
    });
  });
});

app.get("/pollcache", (req, res) => {
  res.send(urlCache);
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

app.listen(5500);