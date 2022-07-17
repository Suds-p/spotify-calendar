import pandas as pd
import numpy as np
from datetime import datetime
from operator import methodcaller as call_m
from glob import glob
# Necessary functions
from os import listdir

#temporary timing checks
from time import time

keep_cols = [
  'username', 'count', 'play-date', 'track_uri', 'song', 'artist', 'album', 
]
# Transforms datetime info into just date info
extract_date = lambda x: str(x).split()[0]
# Dataframe made from JSON files
pandas_df = None
# Dataframes for specific modes
main_df = {
  "songs": None,
  "artists": None
}

"""
create_dataframe:
  (internal function)
  Returns a dataframe made of all JSON files available.
"""
def create_dataframe():
  print("\n! create_dataframe() !\n")
  global pandas_df
  if pandas_df is not None:
    return pandas_df
  
  try:
    data_paths = [("data/" + d) for d in listdir("./data") if ".json" in d]
  except FileNotFoundError:
    return
  
  if data_paths == []:
    return

  print("attempting to read json")
  dfs = [pd.read_json(path) for path in data_paths]
  print("successfully read json")
  all_spotify_df = pd.concat(dfs, ignore_index=True)
  all_spotify_df["Play-Time"] = pd.to_datetime(all_spotify_df["ts"])
  all_spotify_df['play-date'] = all_spotify_df['Play-Time'].apply(extract_date)
  all_spotify_df['count'] = 1
  all_spotify_df.rename(columns={
    "master_metadata_track_name": "song",
    "master_metadata_album_artist_name": "artist",
    "master_metadata_album_album_name": "album",
    "spotify_track_uri": "track_uri",
  }, inplace=True)
  all_spotify_df.drop(all_spotify_df.columns.difference(keep_cols), 1, inplace=True)
  
  pandas_df = all_spotify_df
  return all_spotify_df


"""
build_daily_song_map:
  (internal function)
  Create the main dataframe of most listened songs
  over the entire duration of the user's Spotify history.
"""
def build_daily_song_map(df):
  start = time()
  print("\n! build_daily_song_map() !\n")
  if df is None:
    return
  g = df.groupby(["play-date", "song"]).agg(
    album=pd.NamedAgg(column="album", aggfunc=max),
    artist=pd.NamedAgg(column="artist", aggfunc=max),
    track_uri=pd.NamedAgg(column="track_uri", aggfunc=max),
    count=pd.NamedAgg(column="count", aggfunc=sum))
  g.reset_index(inplace=True)
  result = g.loc[g.groupby(["play-date"]).idxmax()['count']]
  result.set_index("play-date", inplace=True)
  result["track_uri"] = result["track_uri"].map(lambda x: x.split(":")[-1])
  print("SONG BUILD:", '%.2f' % (time() - start))
  return result

"""
build_daily_artist_map:
  (internal function)
  Create the main dataframe of most listened artists
  over the entire duration of the user's Spotify history.
"""
def build_daily_artist_map(df):
  start = time()
  print("\n! build_daily_artist_map() !\n")
  if df is None:
    return
  g = df.groupby(["play-date", "artist"]).agg(
    track_uri=pd.NamedAgg(column="track_uri", aggfunc=max),
    count=pd.NamedAgg(column="count", aggfunc=sum))
  g = g.reset_index()
  result = g.loc[g.groupby(["play-date"]).idxmax()['count']]
  result.set_index('play-date', inplace=True)
  result["track_uri"] = result["track_uri"].map(lambda x: x.split(":")[-1])
  print("ARTIST BUILD:", '%.2f' % (time() - start))
  return result


"""
get_today_date_string:
  (internal function)
  Returns today's date as a string in the format 'YYYY-mm-dd'.
"""
def get_today_date_string():
  return datetime.today().strftime('%Y-%m-%d')


"""
find_daily_songs:
  Returns a JSON map of dates to most listened songs on those dates
  for the duration of a specific range of the user's history.
  If end_date is an empty string, it defaults to today's date.
"""
def find_daily_songs(start_date, end_date):
  print("\n! find_daily_songs() !\n")
  global main_df
  if main_df['songs'] is None:
    main_df['songs'] = build_daily_song_map(create_dataframe())
  
  if main_df['songs'] is not None:
    end_date = get_today_date_string() if end_date == "" else end_date
    return main_df['songs'][
      (start_date <= main_df['songs'].index) & (main_df['songs'].index <= end_date)
    ].to_json(orient="index")


"""
find_daily_artists:
  Returns a JSON map of dates to most listened songs on those dates
  for the duration of a specific range of the user's history.
  If end_date is an empty string, it defaults to today's date.
"""
def find_daily_artists(start_date, end_date):
  print("\n! find_daily_artists() !\n")
  global main_df
  if main_df['artists'] is None:
    main_df['artists'] = build_daily_artist_map(create_dataframe())
  
  if main_df['artists'] is not None:
    end_date = get_today_date_string() if end_date == "" else end_date
    return main_df['artists'][
        (start_date <= main_df['artists'].index) & (main_df['artists'].index <= end_date)
      ]\
      .to_json(orient="index")
      # .drop(columns=["username", "song", "album"])\
      
      
      


"""
check_files_present:
Returns True if any user data files are present in the "data" folder
and False otherwise.
"""
def check_files_present():
  print("\n! check_files_present() !\n")
  return len(glob("./data/*")) > 0


"""
get_start_date:
Returns first date in user's listening history as a string.
String is returned in "yyyy-mm-dd" format.
If history not available, returns None.
"""
def get_start_date():
  global main_df
  if main_df['songs'] is None:
    main_df['songs'] = build_daily_song_map(create_dataframe())

  if main_df['songs'] is not None:
    return main_df['songs'].iloc[0].name


"""
build_maps:
Creates the daily song and daily artist maps and stores them in global variables.
"""
def build_maps():
  df = create_dataframe()
  main_df['songs'] = build_daily_song_map(df)
  main_df['artist'] = build_daily_artist_map(df)
  return (df is not None) and (main_df['songs'] is not None) and (main_df['songs'] is not None)

