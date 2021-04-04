//Extracts filters and returns all relevant data from the user's saved DB ids.


const {db} = require('./db');
const {spotify} = require('./spotify');
const {filter} = require('./filter');

/**
 * 
 * @param {*} access_token 
 * @returns 
 */
const getStats = async (access_token) => {
    //Change this line to update the time parameters to restrict data from only N number of days
    const tracks = await db.getTracks(access_token);
    const tracksWithFullData = [];
    //Chunking tracks by 50 each time
    for (var i=0,j = tracks.length; i<j; i+=50) {
        const tracks50 = tracks.slice(i, i+50);
        const tracks50WithMetadata = await spotify.getSeveralTracks(access_token, tracks50);
        const tracks50WithAudioFeatures = await spotify.getSeveralTracksAudioFeatures(access_token, tracks50);
        const tracks50WithFullData = await merge(tracks50WithMetadata, tracks50WithAudioFeatures);
        tracks50WithFullData.forEach(track => tracksWithFullData.push(track));
    }
    var tracksAndArtistsWithFullData = await mergeArtistsInfo(access_token, tracksWithFullData);
    await insertPlayedAt(tracks, tracksAndArtistsWithFullData)
    const filteredData = await filter.statsTracks(tracksAndArtistsWithFullData);
    return filteredData;
}

const insertPlayedAt = (PlayedAt, trackWithFullData) => {
    for(let i = 0; i < trackWithFullData.length; i++){
        trackWithFullData[i].played_at = PlayedAt[i].played_at;
    }
}

/**
 * Merge audio features and track data
 * @param {*} tracks 
 * @param {*} audio_features 
 * @returns 
 */
const merge = async (tracks, audio_features) => {
    if(tracks.length != audio_features.length){
        return "error";
    }
    var length = tracks.length;
    const mergedData = [];
    for(var i = 0; i < length; i++){
        var trackDataObject = tracks[i];
        trackDataObject.audio_features = audio_features[i];
        mergedData.push(trackDataObject);
    }
    return mergedData;
}

/**
 * 
 * @param {*} access_token 
 * @param {*} data 
 * @returns 
 */
const mergeArtistsInfo = async (access_token, data) => {
    const tracks = data;
    let artists_ids = [], merge_info_ids = [];
    let start_pos = 0;
    for(let i = 0; i < tracks.length; i++){
        const no_of_ids = tracks[i].artists.length;
        const ids = tracks[i].artists.map(artist => artist.id);
        if(no_of_ids + artists_ids.length <= 50){
            ids.forEach(id => {artists_ids.push(id)});
            merge_info_ids.push(no_of_ids);
        }else{
            await fetchAndMerge(artists_ids, merge_info_ids, start_pos, access_token, data);
            artists_ids = [];
            start_pos = merge_info_ids.length;
            ids.forEach(id => {artists_ids.push(id)});
            merge_info_ids.push(no_of_ids);
        }
    }
    await fetchAndMerge(artists_ids, merge_info_ids, start_pos, access_token, data);
    return data;
}


/**
 * Merges artists info with track & audio features
 * @param {*} artists_ids 
 * @param {*} merge_info_ids 
 * @param {*} start_pos 
 * @param {*} access_token 
 * @param {*} data 
 * @returns 
 */
const fetchAndMerge = async (artists_ids, merge_info_ids, start_pos, access_token, data) => {
    const artists_data = await spotify.getSeveralArtists(access_token, artists_ids);
    for(let i = start_pos, j = 0; i < merge_info_ids.length; i++){
        var count = merge_info_ids[i];
        data[i].artists = artists_data.slice(j, j+count);
        j += count;
    }
    return;
}


module.exports = { getStats };