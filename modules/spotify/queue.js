const { db } = require('../db/database');

async function addToSpotifyQueue(uri) {
    const sql = 'INSERT OR IGNORE INTO spotify_queue (uri) VALUES (?)';
    return await db.run(sql, [uri]);
}

async function getQueuedSongs(limit = 5) {
    const sql = 'SELECT uri FROM spotify_queue LIMIT ?';
    return await db.all(sql, [limit]);
}

async function removeSongFromQueue(uri) {
    const sql = 'DELETE FROM spotify_queue WHERE uri = ?';
    return await db.run(sql, [uri]);
}

async function restoreQueue(spotifyApi) {
    try {
        const queuedSongs = await getQueuedSongs(100);
        for (const song of queuedSongs) {
            try {
                await spotifyApi.addToQueue(song.uri);
                await removeSongFromQueue(song.uri);
            } catch (err) {
                console.error(`Failed to restore song to queue: ${song.uri}`, err);
            }
        }
    } catch (err) {
        console.error('Failed to restore queue:', err);
    }
}

module.exports = {
    addToSpotifyQueue,
    getQueuedSongs,
    removeSongFromQueue,
    restoreQueue
};