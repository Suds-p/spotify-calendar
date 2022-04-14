# Spotify Calendar (Cal)
**Cal** is a simple web app visualization of the songs/artists a user listened to the most over their Spotify history. Users upload JSON data files of their history and the app renders a calendar view with the most listened-to song/artist on each day. Users can also choose a specific date range to view songs over.

This project was a massive learning opportunity for me to put several skills together and learn how to utilize advanced JavaScript along with UI frameworks and a lightweight backend.

![MVP demo](./images/demo.gif)

The initial version of this project was designed to run locally and will soon be available to download and install.

## Gathering Data Files
Follow the steps below to request Spotify to send you a copy of your own listening history, but note this may take up to 10 days to arrive:
1. Log in to your Spotify profile in the browser.
2. Visit account settings by going to `Profile > Account`.
3. Click `Privacy Settings` on the left.
4. Scroll down to the `Download your Data` section.
5. Do NOT click the green button! Instead, send an email to the `privacy@spotify.com` address listed above the steps. Use "Requesting extended Spotify streaming history" as the subject line. In the body, make sure to ask for your **Level 3** data. This part is important or you won't get all of your history!
6. Wait a couple days until you get a download link in your email.


## Technologies Used
* Node 16
* React 17
* Flask
* pandas & numpy
* REST APIs
* esbuild

Node environment with version >=16 is required in order to install locally.

## Coming Soon
- Including the option to see most common artists in a day. Users can only see most common songs so far.
- Being able to switch between individual months/years rather than inputting a range each time.
