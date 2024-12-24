from re import match
from base64 import b64encode
from sys import exit
from flask import Flask, request, Response
from flask_cors import CORS
import json
from counting import find_daily_songs, find_daily_artists, check_files_present, get_start_date
import requests

# Global variables
DATE_REGEX = r"^(20)\d\d-(0[1-9]|1[012])-\d\d" # Pattern for dates from user
TOKEN = '' # User access token to access the Spotify Web API
DATA_PATH = "data/" # Path where data files are stored

########### Get user access token #############
# Read in client secrets
f = open('.secrets', 'r').read()
C_ID, C_SECRET = [line.split()[1] for line in f.split('\n')]

secrets = bytes('Basic ', 'ascii') + b64encode(bytes(f"{C_ID}:{C_SECRET}", 'ascii'))

def refresh_token():
  r = requests.post(
    'https://accounts.spotify.com/api/token',
    {'grant_type': 'client_credentials'},
    headers={'Authorization': secrets})
  if r.status_code >= 400:
    print("Could not communicate with Spotify: " + r.text)
    exit(0)

  return r.json()['access_token']


TOKEN = refresh_token()

########### Set up API endpoints to backend #############

# Listening on port 5000
app = Flask(__name__)
CORS(app, resources={'/*': {'origins': '*'}})


@app.route("/tracks")
def get_tracks():
  global TOKEN
  # Check that parameters are valid
  start = request.args.get("start", default="2001-01-01", type=str)
  end = request.args.get("end", default="2001-01-01", type=str)

  # Ensure correct format and start comes before end date
  if not match(DATE_REGEX, start) or not match(DATE_REGEX, end):
    return Response(f"Dates have incorrect format ({start}, {end})", 400)
  elif start > end:
    return Response(f"Start comes after end date ({start}, {end})", 400)
  
  end = "" if end == "2001-01-01" else end
  result = find_daily_songs(start, end)
  if not result:
    return Response("Could not generate song table", 401)

  # Add album image URLs from Spotify API
  result = json.loads(result)
  keys = result.keys()
  track_URIs = [result[k]["track_uri"] for k in keys]
  print(track_URIs)

  if result == {}:
    return result

  # Attempt to get tracks, or refresh token if necessary
  r = requests.get(
    f"https://api.spotify.com/v1/tracks?ids={','.join(track_URIs)}",
    headers={'Authorization': 'Bearer ' + TOKEN})
  if r.status_code >= 400:
    if "access token" in r.text:
      TOKEN = refresh_token()
      r = requests.get(
        f"https://api.spotify.com/v1/tracks?ids={','.join(track_URIs)}",
        headers={'Authorization': 'Bearer ' + TOKEN})
    else:
      return Response("Could not retrieve track info: " + r.text, 402)

  songData = r.json()['tracks']
  album_URLs = [d['album']['images'][1]['url'] for d in songData]
  for i, k in enumerate(keys):
    result[k]['image_url'] = album_URLs[i]

  return result

@app.route("/artists")
def get_artists():
  global TOKEN
  # Check that parameters are valid
  start = request.args.get("start", default="2001-01-01", type=str)
  end = request.args.get("end", default="2001-01-01", type=str)

  # Ensure correct format and start comes before end date
  if not match(DATE_REGEX, start) or not match(DATE_REGEX, end):
    return Response(f"Dates have incorrect format ({start}, {end})", 400)
  elif start > end:
    return Response(f"Start comes after end date ({start}, {end})", 400)
  
  end = "" if end == "2001-01-01" else end
  result = find_daily_artists(start, end)
  if not result:
    return Response("Could not generate artist table", 401)

  # Add artist image URLs from Spotify API
  result = json.loads(result)
  keys = list(result.keys())
  track_URIs = [result[k]["track_uri"] for k in keys]
  
  # TODO: paginate requests for 50 IDs each, instead of all at once
  r = requests.get(
    f"https://api.spotify.com/v1/tracks?ids={','.join(track_URIs)}",
    headers={'Authorization': 'Bearer ' + TOKEN})
  
  # Hit API rate limit
  if r.status_code == 429:
    retry_time = 10 if r.headers['Retry-After'] == None else int(r.headers['Retry-After'])
    time.sleep(retry_time)
  
  if r.status_code >= 400:
    if "access token" in r.text:
      TOKEN = refresh_token()
      r = requests.get(
        f"https://api.spotify.com/v1/tracks?ids={','.join(track_URIs)}",
        headers={'Authorization': 'Bearer ' + TOKEN})
    else:
      return Response("Could not retrieve track info: " + r.text, 402)

  songData = r.json()['tracks']
  artist_IDs = [d['album']['artists'][0]['id'] for d in songData]
  print(artist_IDs)

  r = requests.get(
    f"https://api.spotify.com/v1/artists?ids={','.join(artist_IDs)}",
    headers={'Authorization': 'Bearer ' + TOKEN})
  if r.status_code >= 400:
    return Response("Could not retrieve artist info: " + r.text, 402)

  artistData = r.json()['artists']
  # TODO: Don't need to pull URL from 2nd image, pull from 1st instead
  artist_URLs = ["" if len(d['images']) < 2 else d['images'][1]['url'] for d in artistData]

  for i, k in enumerate(keys):
    result[k]['image_url'] = artist_URLs[i]

  return result

@app.route("/files-present")
def are_files_present():
  return {"filesPresent": check_files_present()}

@app.route("/start-date")
def start_date():
  res = get_start_date()
  return {"startDate": res} if res else Response("Could not get start date", 401)

@app.route("/data-file", methods=['POST'])
def upload_file():
  filename = request.args.get("filename", default="", type=str)
  if filename == "" or request.data == None or len(request.data) == 0:
    return Response("No data detected. Please send a file to upload.", 400)
  f = open(DATA_PATH + filename, 'w')
  f.write(request.data.decode('utf-8'))
  f.close()
  return "File successfully uploaded!"


app.run(debug=True, use_debugger=False, use_reloader=False)