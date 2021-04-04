var fs = require('fs');
var Heap = require('heap');

const { spotify } = require('./spotify');
const { filter } = require('./filter');
const moment = require('moment');

var obj;
fs.readFile('../sampleData/StephenSongs.json', 'utf8', function (err, response) {
    if (err) throw err;
    obj = JSON.parse(response);
    const data = obj.data;
    workWithData(data);
});

const workWithData = async (data) => {
    const data_timespan = getDataFromNDaysAgo(data, 8);
    if(!data_timespan || data_timespan.length == 0) return;
    const duration = findListenDuration(data_timespan);
    console.log(duration);
    const topArtistsHeap = findTopArtists(data_timespan);
    var i = 10
    console.log("Your top 10 Artists");
    while(topArtistsHeap.size() > 0 && i > 0){
        console.log(topArtistsHeap.pop())
        i--;
    }
    console.log();
    i = 10;
    console.log("Your top 10 Tracks");
    const topTracksHeap = findTopTracks(data_timespan);
    while(topTracksHeap.size() > 0 && i > 0){
        console.log(topTracksHeap.pop())
        i--;
    }
} 


const getPast24Hours = (data) => {
    if(!data || data.length == 0) return;
    const tracksFromToday = [];
    const yesterday = moment(new Date()).add(-1, 'days');
    for(let i = 0; i < data.length; i++){
        var played_at = moment(new Date(data[i].played_at));
        if(played_at.isAfter(yesterday)){
            tracksFromToday.push(data[i]);
        }
    }
    return tracksFromToday;
}


const getDataFromNDaysAgo = (data, daysAgo) => {
    if(!data || data.length == 0) return;
    const tracksFromNDaysAgo = [];
    const dayStart = moment(new Date()).subtract(daysAgo, 'days').startOf('day');
    console.log(dayStart);
    const dayEnd = moment(new Date()).subtract(daysAgo, 'days').endOf('day');
    for(let i = 0; i < data.length; i++){
        var played_at = moment(new Date(data[i].played_at));
        if(played_at.isAfter(dayStart) && played_at.isBefore(dayEnd)){
            tracksFromNDaysAgo.push(data[i]);
        }
    }
    return tracksFromNDaysAgo;
}


/**
 * 
 * @param {*} data 
 * @returns Duration of Music listening in Minutes
 */
const findListenDuration = (data) => {
    if(!data || data.length == 0) return;
    var duration = 0;
    for(let i = 0; i < data.length-1; i++){
        var timeLater = moment(new Date(data[i].played_at));
        var timeEarlier = moment(new Date(data[i+1].played_at)).format();
        const difference = moment.duration(Math.abs((timeLater.diff(timeEarlier))));
        duration += Math.min(difference.asMilliseconds(), data[i+1].duration_ms);
    }
    //returns duration in minutes
    return (duration/(1000*60));
} 

const findTopArtists = (data) => {
    if(!data || data.length == 0) return;
    const artistsMap = {};
    for(let i = 0; i < data.length; i++){
        const artists = data[i].artists;
        artists.forEach(artist => {
            const id = artist.id;
            if(artistsMap[id]){
                artistsMap[id].listens += 1;
            }else{
                artistsMap[id] = {
                    "name": artist.name,
                    "listens": 1
                }
            }
        })
    }
    var heap = new Heap(function(a, b) {
        return b.listens - a.listens;
    });
    const artistsIds = Object.keys(artistsMap); 
    artistsIds.forEach(id => {
        heap.push(artistsMap[id]);
    })
    return heap;
}

const findTopTracks = (data) => {
    if(!data || data.length == 0) return;
    const tracksMap = {};
    for(let i = 0; i < data.length; i++){
        var id = data[i].id;
        if(tracksMap[id]){
            tracksMap[id].listens += 1;
        }else{
            tracksMap[id] = {
                "name": data[i].name,
                "listens": 1
            }
        }
    }
    var heap = new Heap(function(a, b) {
        return b.listens - a.listens;
    });
    const tracksIds = Object.keys(tracksMap); 
    tracksIds.forEach(id => {
        heap.push(tracksMap[id]);
    })
    return heap;
}