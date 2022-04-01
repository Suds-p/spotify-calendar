from flask import Flask, request, Response
from counting import find_all_daily_songs, find_range_daily_songs
from re import match

# Global variables
DATE_REGEX = r"^(20)\d\d-(0[1-9]|1[012])-\d\d"

# Listening on port 5000
app = Flask(__name__)

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
  return result if result else Response("No data available to process", 401)
  # return f"Congrats, your dates were successfully received! ({start}, {end})"
