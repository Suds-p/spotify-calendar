from base64 import b64encode
import requests


# Read in client secrets
f = open("../.secrets", "r")
C_ID, C_SECRET = [line.split()[1] for line in f.read().split('\n')]
f.close()

secrets = bytes("Basic ", "ascii") + b64encode(bytes(f"{C_ID}:{C_SECRET}", "ascii"))

def refresh_token():
    r = requests.post(
        "https://accounts.spotify.com/api/token",
        {"grant_type": "client_credentials"},
        headers={"Authorization": secrets})
    if r.status_code >= 400:
        print("Could not communicate with Spotify: " + r.text)
        exit(0)

    return r.json()["access_token"]


def get_multiple_tracks(track_URIs, token):
    return requests.get(
        f"https://api.spotify.com/v1/tracks?ids={','.join(track_URIs)}",
        headers={"Authorization": "Bearer " + token})


def get_multiple_artists(artist_IDs, token):
    return requests.get(
        f"https://api.spotify.com/v1/artists?ids={','.join(artist_IDs)}",
        headers={"Authorization": "Bearer " + token})
