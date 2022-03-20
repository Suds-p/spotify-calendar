import express from 'express';
import { Buffer } from 'buffer';
import request from 'request';
import cors from 'cors';
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

// :date comes in the following format: "2021-06"
app.get('/tracks/:date', (req, res) => {
  console.log(req.params.date);
  const dummyIds = [
    '28X17z5F4ANEeOiEDGiUYw',
    '3oIhthYPSKwAwJLA8JClkV',
    '1Qpq65tfyd7NWmIf3gRxEU',
    '0XOnMqLQDO89iAg7dWWwnG',
    '39VvPc7qjMKmuv7O5bbABr',
    '7xcJPouJypWC8OWlub6zuq',
    '6ubPFMzlIg73d1jzzWcC8B',
    '37lnTsAgTOcCmwBrWMD4nC',
    '1V5EGX93Ezv1mxow0b4pwC',
    '66tOfHVH3aUrscg8vExRV4',
    '6GGvhFPEb4EmPmjmhdDF8g',
    '6OocN63GLU7NF0wHdewhID',
    '7iVc91ubTt3leh5NXmFi5a',
    '19CWhKIND6v9DiIuMKTfxR',
    '3sm1DwUUyiLJ554xI2xopb',
    '16QgMC7mlzvMFsnIsRJjVx',
    '4SRmuCvnoo5UZihRE4ZqL2',
    '5OsKqfRR6OuGGaMcKPG1ti',
    '7fJFDK6XjYsXcMKNHESbot',
    '1c2XHrTfvSkoJsET2IdbaD',
    '6WF4hzdGXvXd1joERSXJjm',
    '4ut2MZrkWzi55VbsEvtiWJ',
    '5LNRJeKmVEQ9lC7GTwXzFy',
    '6bYjGypygqgC7iTndExL43',
    '12GEpg2XOPyqk03JZEZnJs',
    '0ST1l4GoKnC1pnHILfiEod',
    '3Kj7B5m1M6soxWuFZFCzEV',
    '3W0fmsdPgPisEQEfefimGT',
    '1nCH6cJraEjKgtywql8dfQ',
    '1SPSSdzFks7DS80Q9NLWrl',
    '66tOfHVH3aUrscg8vExRV4',
  ];

  // Create array of promises and resolve all of them before sending
  Promise.all(
    dummyIds.map(song_id => 
      new Promise((res, rej) => {
        var trackOptions = {
          url: `https://api.spotify.com/v1/tracks/${song_id}`,
          headers: {'Authorization': 'Bearer ' + token},
          json: true
        };
        request.get(trackOptions, function(error, response, song) {
          let url = song.album.images[1].url;
          res(url);
        });
      })
    )
  )
  .then(albumUrls => res.send(albumUrls))
  .catch(err => console.log(err));
})

app.listen(5500);

// const body = document.getElementsByTagName('main')[0];
const song_id = '1Qpq65tfyd7NWmIf3gRxEU';
let token = '';

fetch(".secrets")
.then(response => response.json())
.then(json => {
  let {client_id, client_secret} = json;
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
})
