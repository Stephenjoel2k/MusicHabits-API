const express = require('express')
const mongodb = require('mongodb')
const router = express.Router()
const { spotify } = require('../Models/spotifyApi.js')
const { time } = require('../Models/time.js')
const { load_recently_played } = require('../Models/user.js')


router.get('/', async (req, res) => {
  const access_token = await req.session.secret
  const user = await spotify.getUserProfile(access_token)
  req.session.user_id = await user.id
  req.session.name = await user.display_name
  res.redirect('/user/' + req.session.user_id + '/top-tracks')
})

router.get('/:id/top-artists', async (req, res) => {
  const access_token = await req.session.secret
  const topArtists = await spotify.getUserTop("artists", "long_term", 50, 0, access_token)
  const artists = [];
  let i = 1;
  topArtists.items.forEach(artist => {
    artists.push(`${i++} : ${artist.name}`);
  })
  res.send(artists)
})

router.get('/:id/top-tracks', async (req, res) => {
  const access_token = await req.session.secret
  const topTracks = await spotify.getUserTop("tracks", "short_term", 50, 0, access_token)
  const tracks = []
  let i = 1;
  topTracks.items.forEach(track => {
    tracks.push(`${i++} : ${track.name}`)
  })
  res.send(tracks)
})



router.get('/:id/recently-played', async (req, res) => {
  while(1 == 1){
    const access_token = await req.session.secret
    const username = await req.session.user_id
    const history = await spotify.recentlyPlayed(access_token)
    const items = history.items.reverse()
    const tracks = []
    const tracksTime = []

    //Loop through each item in the recently_played items array (currently reversed)
    items.forEach(item => {
      var played_at = time.format(item.played_at)
      tracksTime.forEach((times) => {
        if(time.equals(times, played_at)){
          played_at.repeat = true
        }
      });
      //Only add the valid items(tracks) into the tracks array.
      if(played_at.repeat != true){
        tracks.push({track: item.track.name, played_at: played_at})
        tracksTime.push(played_at)
      }
    });
    console.log(tracks);
    
    //Load DB
    const recently_played = await load_recently_played(username)
    const db_tracks = await recently_played.find({}).toArray()
    const db_tracks_latest = db_tracks[db_tracks.length - 1]
    for (var i = 0; i < tracks.length; i++) {
      if(db_tracks_latest){
        if(time.after(db_tracks_latest.played_at, tracks[i].played_at)){
          await recently_played.insertOne({track: tracks[i].track, played_at: tracks[i].played_at})
        }
      }
      else{
        await recently_played.insertOne({track: tracks[i].track, played_at: tracks[i].played_at})
      }
    }
    await delay(200000)
    console.log("refreshing")
  }
})


const delay = (duration) =>
  new Promise(resolve => setTimeout(resolve, duration))

module.exports = router
