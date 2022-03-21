# Spotify Calendar (Cal)
One of my children that I'm still currently gestating.
This project aims to present a calendar view of the most listened to songs on a user's Spotify for as long as they've been listening. Primary function of this README is to be a todo list really so don't expect much explanation here.

### Todos:
0. ~~Replace everything with React components (merge body.jsx and main.js)~~
1. ~~Render multiple months within a certain date range~~
2. ~~Add initial screen to ask for date range~~
3. ~~Actually switch from initial to calendar screen~~
4. Change own API to return more info on songs (name, artist, # of listens, etc.)
4.5 Make build_song_map() a heckin' lot more efficient, por favor.
5. Show more info on hover
6. Add some way for user to import Spotify data
7. Process user data to get most listened songs
8. Loading screen?
9. Maybe add error handling for Python in case data files don't exist.

### Progress
- March 15, 2022 - Started project. Pulled album covers from track IDs.
- March 16, 2022 - Eventful day.
  - Realized that require() is only available in Node envs.
  - Learned how to set up React project from scratch (so painful but so worth it). 
  - Used "esbuild" instead of Webpack; don't know how it works but it transpiles JSX into normal JS with babel and bundles files automatically and works like magic essentially.
  - Added React to this project.
- March 17, 2022 - Lots more stuff today.
  - Made React comps and rendered mult. months within a certain date range.
  - Set up state so app switches from first screen to calendar screen.
  - Set up Python stuff + virtualenv to run flask in a separate space.
  - Got VSCode to recognize Python packages (took so long).
  - Successfully used Python to get the highest counted songs of all time.
  - Learned how to iterate over **groupby** objects.
  - Made a list of Python functions to write.
- March 18, 2022 - Wrote and debugged the main Python functions.
- March 19, 2022 - Python efficiency day.
  - Ran build_daily_song_map function on main dataframe, took 13 mins overall D:
  - Improved build_daily_song_map runtimes, now executes in under 7 mins.
- March 20, 2022 - We're learning so much about big data here.
  - Improved build_daily_song_map runtimes again, now at 8 secs for a 98% reduction.
  - Learned how to use idxmax() (index max) to get positions for songs with max numbers.
