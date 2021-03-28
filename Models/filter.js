/**
 * Contains functions that filter unecessary data to prevent space wastage.
 */
const moment = require('moment');

/**
 * Initially planned on using this function for storing into the DB
 * @param {array} items 
 * @returns 
 */
const recentTracks = (items) => {
    const recents = [];
    items.forEach(item => {
        const artists = [];
        item.track.artists.forEach(artist => {
            artists.push({"id": artist.id, "name" : artist.name});
        })
        const schema = {
            "track_id" : item.track.id,
            "track_name" : item.track.name,
            "artists": artists,
            "duration_ms" : item.track.duration_ms,
            "track_popularity" : item.track.popularity,
            "played_at" : item.played_at
        }
        recents.push(schema);
    });
    return recents;
}

/**
 * This is a better solution for storing in the DB as this is lighter and sufficient
 * @param {Array} items 
 * @returns 
 */
const dbRecentTracks = (items) => {
    const dbrecentIds = [];
    items.forEach(item => {
        dbrecentIds.push({"t_id": item.track.id,"played_at": new Date(moment(item.played_at).utc())});
    })
    return dbrecentIds;
}


const filter = {
    recentTracks,
    dbRecentTracks,
}

module.exports = {filter}