const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

const SPOTIFY_SCOPES = [
    'user-read-private', 
    'user-read-email', 
    'playlist-modify-public', 
    'playlist-modify-private', 
    'playlist-read-private', 
    'playlist-read-collaborative',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control'
];

module.exports = {
    spotifyApi,
    SPOTIFY_SCOPES
};