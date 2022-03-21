from flask import Flask, request, Response
from counting import *

# Listening on port 5000
app = Flask(__name__)

@app.route("/all-common-tracks")
def all_common_tracks():
  return build_daily_song_map()

@app.route("/range-common-tracks")
def range_common_tracks():
  # Check that parameters are valid
  start = request.args.get("start", default="2001-01-01", type=str)
  end = request.args.get("end", default="2001-01-01", type=str)

  # Has correct date format
  

