from re import match
from base64 import b64encode
from sys import exit
from flask import Flask, request, Response
from flask_cors import CORS
import json
from counting import find_all_daily_songs, find_range_daily_songs, check_files_present, get_start_date
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
r = requests.post(
  'https://accounts.spotify.com/api/token',
  {'grant_type': 'client_credentials'},
  headers={'Authorization': secrets})
if r.status_code >= 400:
  print("Could not communicate with Spotify: " + r.text)
  exit(0)

TOKEN = r.json()['access_token']

########### Set up API endpoints to backend #############

# Listening on port 5000
app = Flask(__name__)
CORS(app, resources={'/*': {'origins': '*'}})

@app.route("/all-common-tracks")
def all_common_tracks():
  result = find_all_daily_songs()
  return result if result else Response("No data available to process", 401)

@app.route("/range-common-tracks")
def range_common_tracks():
  # Check that parameters are valid
  start = request.args.get("start", default="2001-01-01", type=str)
  end = request.args.get("end", default="2001-01-01", type=str)

  # Has correct date format
  if not match(DATE_REGEX, start) or not match(DATE_REGEX, end):
    return Response(f"Dates have incorrect format ({start}, {end})", 400)
  # Start comes before end date
  elif start > end:
    return Response(f"Start comes after end date ({start}, {end})", 400)
  
  result = find_range_daily_songs(start, end)
  if not result:
    return Response("No data available to process", 401)

  # Add album image URLs from Spotify API
  result = json.loads(result)
  keys = result.keys()
  track_URIs = [result[k]["track_uri"] for k in keys]
  r = requests.get(
    f"https://api.spotify.com/v1/tracks?ids={','.join(track_URIs)}",
    headers={'Authorization': 'Bearer ' + TOKEN})
  if r.status_code >= 400:
    return Response("Could not retrieve track info: " + r.text, 402)

  songData = r.json()['tracks']
  album_URLs = [d['album']['images'][1]['url'] for d in songData]
  for i, k in enumerate(keys):
    result[k]['album_url'] = album_URLs[i]

  return result

@app.route("/files-present")
def are_files_present():
  return {"filesPresent": check_files_present()}

@app.route("/start-date")
def start_date():
  res = get_start_date()
  return {"startDate": res} if res else Response("No data available to process", 401)

@app.route("/upload-file", methods=['POST'])
def upload_file():
  filename = request.args.get("filename", default="", type=str)
  if filename == "":
    return Response("No data detected. Please send a file to upload.", 401)
  f = open(DATA_PATH + filename, 'w')
  f.write(request.data.decode('utf-8'))
  f.close()
  return "File successfully uploaded!"

