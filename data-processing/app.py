from re import match
from sys import exit
from flask import Flask, request, Response
from flask_cors import CORS
import json
from counting import get_top_songs_in_range, get_top_artists_in_range, check_files_present, get_start_date
from constants import *
import spotifyService

# Global variables
DATE_REGEX = r"^(20)\d\d-(0[1-9]|1[012])-\d\d" # Pattern for dates from user
TOKEN = "" # User access token to access the Spotify Web API
DATA_PATH = "data/" # Path where data files are stored

########### Get user access token #############
TOKEN = spotifyService.refresh_token()

########### Set up API endpoints to backend #############
# Listening on port 5000
app = Flask(__name__)
CORS(app, resources={"/*": {"origins": "*"}})

def _spotify_get_item_ID(json):
  return json["id"]

def _spotify_get_album_URL(json):
  return json["album"]["images"][1]["url"]

def _spotify_get_track_artist_ID(json):
  return json["album"]["artists"][0]["id"]

def _spotify_get_artist_URL(json):
  return "" if len(json["images"]) < 2 else json["images"][1]["url"]

def paginateRequest(idList, requestFn, updateFn, errorMsg):
  global TOKEN
  for i in range(0, len(idList), 50):
    sublist_IDs = idList[i: i+50]
    r = requestFn(sublist_IDs, TOKEN)
    
    # Hit API rate limit
    if r.status_code == 429:
      retry_time = 10 if r.headers["Retry-After"] == None else int(r.headers["Retry-After"])
      time.sleep(retry_time)
    
    if r.status_code >= 400:
      if "access token" in r.text:
        TOKEN = spotifyService.refresh_token()
        result = requestFn(sublist_IDs, TOKEN)
      else:
        return Response(errorMsg + ": " + r.text, 500)
    
    updateFn(r)

@app.route("/tracks")
def get_tracks():
  global TOKEN
  # Check that parameters are valid
  start = request.args.get(START, default="2001-01-01", type=str)
  end = request.args.get(END, default="2001-01-01", type=str)

  # Ensure correct format and start comes before end date
  if not match(DATE_REGEX, start) or not match(DATE_REGEX, end):
    return Response(f"Dates have incorrect format ({start}, {end})", 400)
  elif start > end:
    return Response(f"Start comes after end date ({start}, {end})", 400)
  
  end = "" if end == "2001-01-01" else end
  result = get_top_songs_in_range(start, end)
  if not result:
    return Response("Could not generate song table", 500)
  
  result = json.loads(result)
  # Keys are date strings
  keys = result.keys()
  # Extract track URIs to get image information
  track_URIs = list(set([result[k][TRACK_URI] for k in keys]))

  if result == {}:
    return result

  # Add album image URLs from Spotify API
  album_URLs = {}
  def albumUpdateFn(result):
    tracksData = result.json()["tracks"]
    album_URLs.update({_spotify_get_item_ID(d): _spotify_get_album_URL(d) for d in tracksData})
  paginateRequest(track_URIs, spotifyService.get_multiple_tracks, albumUpdateFn, "Could not retrieve track info")
  
  for k in keys:
    result[k]["image_url"] = album_URLs[result[k][TRACK_URI]]

  return result

@app.route("/artists")
def get_artists():
  global TOKEN
  # Check that parameters are valid
  start = request.args.get(START, default="2001-01-01", type=str)
  end = request.args.get(END, default="2001-01-01", type=str)

  # Ensure correct format and start comes before end date
  if not match(DATE_REGEX, start) or not match(DATE_REGEX, end):
    return Response(f"Dates have incorrect format ({start}, {end})", 400)
  elif start > end:
    return Response(f"Start comes after end date ({start}, {end})", 400)
  
  end = "" if end == "2001-01-01" else end
  result = get_top_artists_in_range(start, end)
  if not result:
    return Response("Could not generate artist table", 500)

  # Add artist image URLs from Spotify API
  result = json.loads(result)
  keys = list(result.keys())
  track_URIs = list(set([result[k][TRACK_URI] for k in keys]))
  track_to_artist_ID = {}
  def trackUpdateFn(result):
    tracksData = result.json()["tracks"]
    track_to_artist_ID.update({_spotify_get_item_ID(d): _spotify_get_track_artist_ID(d) for d in tracksData})
  paginateRequest(track_URIs, spotifyService.get_multiple_tracks, trackUpdateFn, "Could not retrieve track info")
  
  artist_IDs = list(track_to_artist_ID.values())
  artist_URLs = {}
  def artistUpdateFn(result):
    artistsData = result.json()["artists"]
    artist_URLs.update({_spotify_get_item_ID(d): _spotify_get_artist_URL(d) for d in artistsData})
  paginateRequest(artist_IDs, spotifyService.get_multiple_artists, artistUpdateFn, "Could not retrieve artist info")

  for k in keys:
    result[k]["image_url"] = artist_URLs[track_to_artist_ID[result[k][TRACK_URI]]]

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
  filename = request.args.get(FILENAME, default="", type=str)
  if filename == "" or request.data == None or len(request.data) == 0:
    return Response("No data detected. Please send a file to upload.", 400)
  f = open(DATA_PATH + filename, "w")
  f.write(request.data.decode("utf-8"))
  f.close()
  return "File successfully uploaded!"


app.run(debug=True, use_debugger=False, use_reloader=True)