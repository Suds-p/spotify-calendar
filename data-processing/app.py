from flask import Flask
from counting import build_daily_song_map

# Listening on port 5000
app = Flask(__name__)

@app.route("/hello")
def hello():
  return "hi there ur really cute do you wanna go out?"

@app.route("/tracks")
def get_song_map():
  return build_daily_song_map()