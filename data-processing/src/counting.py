import pandas as pd
import numpy as np
from datetime import datetime
from operator import methodcaller as call_m
from glob import glob
from constants import DATA_PATH
# Necessary functions
from os import listdir

#temporary timing checks
from time import time

TIMEZONE = "America/New_York"
keep_columns = ["artist", "album", "count", "ms_played", "play-date", "Play-Time", "track_uri", "track"]
# Transforms datetime info into just date info
extract_date = lambda x: str(x).split()[0]
# Dataframe made from JSON files
pandas_df = None
artist_df = None
album_df = None
track_df = None
# Dataframes for specific modes
main_df = {
  "tracks": None,
  "artists": None
}

"""
create_dataframe:
  (internal function)
  Returns a dataframe made of all JSON files available.
"""
def create_dataframe():
  print("\n! create_dataframe() !\n")
  global pandas_df, album_df, artist_df, track_df
  if pandas_df is not None:
    return pandas_df
  
  try:
    data_paths = [(DATA_PATH + d) for d in listdir(DATA_PATH) if ".json" in d]
  except FileNotFoundError:
    return
  
  if data_paths == []:
    return
  
  # Concatenate all JSON files into dataframe
  dfs = [pd.read_json(path) for path in data_paths]
  all_spotify_df = pd.concat(dfs, ignore_index=True)
  # Localize datetime values
  all_spotify_df["Play-Time"] = pd.to_datetime(all_spotify_df["ts"])
  all_spotify_df["Play-Time"] = all_spotify_df["Play-Time"].dt.tz_convert(TIMEZONE)
  all_spotify_df["play-date"] = all_spotify_df["Play-Time"].apply(extract_date)
  all_spotify_df["count"] = 1
  all_spotify_df.rename(columns={
    "master_metadata_track_name": "track",
    "master_metadata_album_artist_name": "artist",
    "master_metadata_album_album_name": "album",
    "spotify_track_uri": "track_uri",
  }, inplace=True)
  all_spotify_df.drop(all_spotify_df.columns.difference(keep_columns), axis=1, inplace=True)
  
  # Rename columns and extract date/time values into columns
  all_spotify_df["year"] = pd.DatetimeIndex(all_spotify_df["Play-Time"]).year
  all_spotify_df["month"] = pd.DatetimeIndex(all_spotify_df["Play-Time"]).month
  all_spotify_df["day"] = pd.DatetimeIndex(all_spotify_df["Play-Time"]).day
  all_spotify_df["weekday"] = pd.DatetimeIndex(all_spotify_df["Play-Time"]).weekday
  all_spotify_df["time"] = pd.DatetimeIndex(all_spotify_df["Play-Time"]).time
  all_spotify_df["hour"] = pd.DatetimeIndex(all_spotify_df["Play-Time"]).hour
  all_spotify_df["day-name"] = all_spotify_df["Play-Time"].apply(call_m("day_name"))
  all_spotify_df["track_uri"] = all_spotify_df["track_uri"].str.split(":", expand=True)[2]
  all_spotify_df.drop(columns=["Play-Time"], inplace=True)
  
  # Remove any potential podcast rows
  all_spotify_df.dropna(subset=["artist", "album", "track"], inplace=True)
  
  # Make index dataframes for artist, album, and track to avoid duplicates
  artist_df = all_spotify_df[["artist"]].drop_duplicates().reset_index(drop=True)
  album_df = all_spotify_df[["album"]].drop_duplicates().reset_index(drop=True)
  track_df = all_spotify_df[["track", "track_uri"]].drop_duplicates().reset_index(drop=True)
  
  # Add index columns for merging; update types to reduce space
  artist_df["artist_id"] = artist_df.index.astype("uint16")
  album_df["album_id"] = album_df.index.astype("uint16")
  track_df["track_id"] = track_df.index.astype("uint16")
  
  assert not artist_df["artist"].isna().any()
  assert not album_df["album"].isna().any()
  assert not track_df["track"].isna().any()
  
  # Replace artist, album, track in dataframe with their indexes
  all_spotify_df = all_spotify_df.merge(artist_df, on="artist", how="left")
  all_spotify_df = all_spotify_df.merge(album_df, on="album", how="left")
  all_spotify_df = all_spotify_df.merge(track_df, on="track_uri", how="left", suffixes=(None, "_copy"))
  all_spotify_df.drop(columns=["artist", "album", "track", "track_copy"], inplace=True)
  
  pandas_df = all_spotify_df
  return all_spotify_df


"""
build_daily_song_map:
  (internal function)
  Returns dataframe of most listened songs over the user's entire Spotify history.
  
  Index: play-date
  Columns: album, artist, track, track_uri, count
"""
def build_daily_song_map(df):
  start = time()
  print("\n! build_daily_song_map() !\n")
  if df is None:
    return
  
  g = df.groupby(["play-date", "track_uri"]).agg(
    album_id=pd.NamedAgg(column="album_id", aggfunc="max"),
    artist_id=pd.NamedAgg(column="artist_id", aggfunc="max"),
    track_id=pd.NamedAgg(column="track_id", aggfunc="max"),
    count=pd.NamedAgg(column="count", aggfunc="sum"))
  g.reset_index(inplace=True)
  # Only keep rows with the max 'count' value for that day
  result = g.loc[g.groupby(["play-date"]).idxmax()["count"]]
  # Sub in names from other tables
  result = result.merge(album_df, on="album_id", how="left").drop(columns=["album_id"])
  result = result.merge(artist_df, on="artist_id", how="left").drop(columns=["artist_id"])
  result = result.merge(track_df, on=["track_id", "track_uri"], how="left").drop(columns=["track_id"])
  result.set_index("play-date", inplace=True)
  
  print("SONG BUILD:", "%.2f" % (time() - start))
  return result

"""
build_daily_artist_map:
  (internal function)
  Returns dataframe of most listened artists over the user's Spotify history.
  
  Index: play-date
  Columns: artist, track_uri, count
"""
def build_daily_artist_map(df):
  start = time()
  print("\n! build_daily_artist_map() !\n")
  if df is None:
    return
  
  g = df.groupby(["play-date", "artist_id"]).agg(
    track_uri=pd.NamedAgg(column="track_uri", aggfunc="max"),
    count=pd.NamedAgg(column="count", aggfunc="sum"))
  g.reset_index(inplace=True)
  # Only keep rows with the max 'count' value for that day
  result = g.loc[g.groupby(["play-date"]).idxmax()["count"]]
  # Sub in names from other tables
  result = result.merge(artist_df, on="artist_id", how="left").drop(columns=["artist_id"])
  result.set_index("play-date", inplace=True)
  
  print("ARTIST BUILD:", "%.2f" % (time() - start))
  return result


"""
get_today_date_string:
  (internal function)
  Returns today"s date as a string in the format "YYYY-mm-dd".
"""
def get_today_date_string():
  return datetime.today().strftime("%Y-%m-%d")


"""
get_top_songs_in_range:
  Returns a JSON map of dates to most listened songs on those dates
  for the duration of a specific range of the user's history.
  If end_date is an empty string, it defaults to today's date.
"""
def get_top_songs_in_range(start_date, end_date):
  return get_top_names_in_range(start_date, end_date, "tracks")


"""
get_top_artists_in_range:
  Returns a JSON map of dates to most listened songs on those dates
  for the duration of a specific range of the user's history.
  If end_date is an empty string, it defaults to today's date.
"""
def get_top_artists_in_range(start_date, end_date):
  return get_top_names_in_range(start_date, end_date, "artists")


"""
get_top_names_in_range:
(Internal function)
Returns either top tracks or artists in date range.
"""
def get_top_names_in_range(start_date, end_date, key):
  global main_df
  if main_df[key] is None:
    build_maps()
  
  end_date = get_today_date_string() if end_date == "" else end_date
  ret = main_df[key][
    (start_date <= main_df[key].index) & (main_df[key].index <= end_date)
  ]
  
  return ret.to_json(orient="index")


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
Returns first date in user's listening history in "yyyy-mm-dd" format.
Returns None if no history is available.
"""
def get_start_date():
  global main_df
  if main_df["tracks"] is None:
    main_df["tracks"] = build_daily_song_map(df)
  
  return main_df["tracks"].iloc[0].name


"""
build_maps:
Creates the daily song and artist maps and stores them in global variables.
"""
def build_maps():
  df = create_dataframe()
  main_df["tracks"] = build_daily_song_map(df)
  main_df["artists"] = build_daily_artist_map(df)
  return (df is not None) and (main_df["tracks"] is not None) and (main_df["artists"] is not None)
