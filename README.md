# Spotify Calendar (Cal)
Screenshots to come soon...
This project takes in a user's Spotify listening history (supplied as external files) and renders a calendar view of the most listened-to songs on their Spotify for as long as they've been listening. User chooses a specific date range to view songs over. Coming soon, user will also be able to choose between seeing most common songs _or_ artists. 


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
  - We're on GitHub now!!
- March 21, 2022 - Attempting to tie back + frontends together.
  - Command to run flask program is just "flask run". File should always be app.py.
  - Command to run node server is just "npm run devStart".
  - JSON now successfully transfers from Python to JS side.
- March 23, 2022 - Learned more about using React correctly.
  - Changed Calendar to be class component with state so incoming API responses are stored.
  - Tweaked backend to send data in right format
  - Lifecycle methods are very helpful.
  - Realized app should be caching URLs to avoid high API call rates.
- March 24, 2022 - Mostly caching day.
  - Added URL cache for album covers.
  - Restyled months to fit side by side.
  - Added tooltips to each date. Used @tippy.js/react (important lesson: this also needed the original library).
- March 25, 2022 - Bug fixes, handling API errors, added date pickers to front page.
- March 27, 2022 - Learned how to read files from POST requests and save to disk.
- March 29, 2022 - Re-learned how to read files from POST requests using body-parser. Implemented file uploading and had to increase file limits accepted by body-parser.
- March 31, 2022 - Extremely hard bugs today.
  - Darn character encoding caught me offguard. Learned that readAsText() takes encoding into account whereas readAsBinaryString() does not.
  - Redid some Promise code to run sequentially instead of parallely to avoid server overload.
- April 2, 2022 - Adding in last few features of MVP.
