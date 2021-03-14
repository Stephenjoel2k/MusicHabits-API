const axios = require('axios');
var request = require('request');

//Type 1
//Fetches the current user's basic profile information
const getUserProfile = async (access_token) => {
  const url = "https://api.spotify.com/v1/me"
  const response = await axios.get(url, {
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  return response.data
}


//Type 1
//Fetches the users' top artists/songs
//Type = "artists" or "tracks"
//time_range = "long_term" or "mid_term" or "short_term"
//limit = 0-50 (int)
//offset = 0-50 (int)
const getUserTop = async(type, time_range, limit, offset, access_token) => {
  const url = "https://api.spotify.com/v1/me/top/" + type + "?time_range=" + time_range + "&limit=" + limit + "&offset=" + offset
  const response = await axios.get(url, {
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  return response.data
}

const getUserDevices = async(access_token) => {
  const active_devices = []
  const url = "https://api.spotify.com/v1/me/player/devices"
  const response = await axios.get(url, {
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  const devices = response.data.devices
  devices.forEach(device => {
    if(device.is_active){
      active_devices.push(device.id)
    }
  });
  return active_devices
}

const addToQueue = async(access_token, device_id, track_id) => {
  const url = "https://api.spotify.com/v1/me/player/add-to-queue?uri="+ track_id  + "&device_id=" + device_id
  request.post(url,{ headers: { Authorization: "Bearer " + access_token } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body);
          }
      }
  );
}

const currentlyPlaying = async(access_token) => {
  var time_remaining
  const url = "https://api.spotify.com/v1/me/player/currently-playing"
  const response = await axios.get(url, {
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  var json = response.data
  var progress = parseInt(json.progress_ms)
  var duration =  parseInt(json.item.duration_ms)
  time_remaining = duration - progress
  return time_remaining
}



const recentlyPlayed = async(access_token) => {
  const url = "https://api.spotify.com/v1/me/player/recently-played?limit=50"
  const response = await axios.get(url, {
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  return response.data
}


const spotify = {
  currentlyPlaying,
  getUserProfile,
  getUserTop,
  getUserDevices,
  currentlyPlaying,
  addToQueue,
  recentlyPlayed
}

module.exports = { spotify }
