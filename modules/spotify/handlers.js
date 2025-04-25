const { spotifyApi } = require('./config');
const { getQueuedSongs } = require('./queue');

const handleSpotifySearch = async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).send('Bad Request: Missing or invalid query parameter');
    }

    if (!spotifyApi.getAccessToken()) {
        return res.status(401).send('Unauthorized: Access token missing or invalid');
    }

    try {
        const searchData = await spotifyApi.searchTracks(q);
        if (searchData.body.tracks.items.length > 0) {
            const track = searchData.body.tracks.items[0];
            const trackInfo = {
                name: track.name,
                artist: track.artists[0].name,
                uri: track.uri,
                album: {
                    name: track.album.name,
                    smallestImage: track.album.images[track.album.images.length - 1].url,
                    largestImage: track.album.images[0].url
                }
            };
            res.json(trackInfo);
        } else {
            res.status(404).json({ error: 'No tracks found' });
        }
    } catch (err) {
        console.error('Error searching tracks:', JSON.stringify(err, null, 2));
        res.status(500).send(`Error: ${err.message}`);
    }
};

const handlePlayTrack = async (req, res) => {
    const { uri } = req.body;

    if (!uri) {
        return res.status(400).json({ error: "Missing track URI" });
    }

    if (!spotifyApi.getAccessToken()) {
        return res.status(401).json({ error: "Unauthorized: Access token missing or invalid" });
    }

    const trackIdPattern = /^spotify:track:([a-zA-Z0-9]{22})$/;
    const match = uri.match(trackIdPattern);
    if (!match) {
        return res.status(400).json({ error: 'Invalid track URI format' });
    }

    try {
        const trackData = await spotifyApi.getTrack(match[1]);
        const trackInfo = {
            name: trackData.body.name,
            artist: trackData.body.artists[0].name,
            uri: trackData.body.uri,
        };

        const devicesData = await spotifyApi.getMyDevices();
        const devices = devicesData.body.devices;
        
        if (devices.length === 0) {
            return res.status(400).json({ error: "No available devices found" });
        }

        await spotifyApi.play({ uris: [uri], device_id: devices[0].id });
        res.json({ success: true, message: "Playing track!", trackInfo });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: "Playback failed, make sure Spotify is open" });
    }
};

const handleGetQueue = async (req, res) => {
    if (!spotifyApi.getAccessToken()) {
        return res.status(401).json({ error: "Unauthorized: Access token missing or invalid" });
    }

    try {
        const queuedSongs = await getQueuedSongs(100); // Get up to 100 songs from queue
        const trackInfoPromises = queuedSongs.map(async (song) => {
            const trackId = song.uri.split(':')[2]; // Extract ID from spotify:track:ID
            const trackData = await spotifyApi.getTrack(trackId);
            return {
                name: trackData.body.name,
                artist: trackData.body.artists[0].name,
                uri: trackData.body.uri,
                albumImage: trackData.body.album.images[trackData.body.album.images.length - 1]?.url
            };
        });

        const queueItems = await Promise.all(trackInfoPromises);
        res.json(queueItems);
    } catch (err) {
        console.error('Error fetching queue:', err);
        res.status(500).json({ error: "Failed to fetch queue" });
    }
};

module.exports = {
    handleSpotifySearch,
    handlePlayTrack,
    handleGetQueue
};



