import pandas as pd
import numpy as np
from datetime import datetime
from operator import methodcaller as call_m
from glob import glob
# Necessary functions
from os import listdir

keep_cols = [
  'username', 'count', 'play-date', 'spotify_track_uri', 'master_metadata_track_name',
  'master_metadata_album_artist_name', 'master_metadata_album_album_name', 
]
# Transforms datetime info into just date info
extract_date = lambda x: str(x).split()[0]
main_df = None

"""
create_dataframe:
  (internal function)
  Returns a dataframe made of all JSON files available.
"""
def create_dataframe():
  try:
    data_paths = [("data/" + d) for d in listdir("./data") if ".json" in d]
  except FileNotFoundError:
    return
  
  if data_paths == []:
    return

  dfs = [pd.read_json(path) for path in data_paths]
  all_spotify_df = pd.concat(dfs, ignore_index=True)
  all_spotify_df["Play-Time"] = pd.to_datetime(all_spotify_df["ts"])
  all_spotify_df['play-date'] = all_spotify_df['Play-Time'].apply(extract_date)
  all_spotify_df['count'] = 1
  all_spotify_df.drop(all_spotify_df.columns.difference(keep_cols), 1, inplace=True)
  
  return all_spotify_df


"""
build_daily_song_map:
  (internal function)
  Create the main dataframe of most listened songs
  over the entire duration of the user's Spotify history.
"""
def build_daily_song_map(df):
  if df is None:
    return
  g = df.groupby(["play-date", "master_metadata_track_name"]).agg(
    album=pd.NamedAgg(column="master_metadata_album_album_name", aggfunc=max),
    artist=pd.NamedAgg(column="master_metadata_album_artist_name", aggfunc=max),
    track_uri=pd.NamedAgg(column="spotify_track_uri", aggfunc=max),
    count=pd.NamedAgg(column="count", aggfunc=sum))
  g.reset_index(inplace=True)
  result = g.loc[g.groupby(["play-date"]).idxmax()['count']]
  result.set_index("play-date", inplace=True)
  result.rename(columns={"master_metadata_track_name": "song"}, inplace=True)
  result["track_uri"] = result["track_uri"].map(lambda x: x.split(":")[-1])
  return result


"""
find_all_daily_songs:
  Returns a JSON map of dates to most listened songs on those dates 
  for the entire duration of the user's Spotify history.
"""
def find_all_daily_songs():
  global main_df
  if main_df is None:
    main_df = build_daily_song_map(create_dataframe())
  
  if main_df is not None:
    return main_df.to_json(orient="index")


"""
find_range_daily_songs:
  Returns a JSON map of dates to most listened songs on those dates
  for the duration of a specific range of the user's history.
"""
def find_range_daily_songs(start_date, end_date):
  global main_df
  if main_df is None:
    main_df = build_daily_song_map(create_dataframe())
  
  if main_df is not None:
    return main_df[
      (start_date <= main_df.index) & (main_df.index <= end_date)
    ].to_json(orient="index")


"""
check_files_present:
Returns True if any user data files are present in the "data" folder
and False otherwise.
"""
def check_files_present():
  return len(glob("./data/*")) > 0


"""
get_start_date:
Returns first date in user's listening history as a string.
String is returned in "yyyy-mm-dd" format.
If history not available, returns None.
"""
def get_start_date():
  global main_df
  if main_df is None:
    main_df = build_daily_song_map(create_dataframe())

  if main_df is not None:
    return main_df.iloc[0].name
