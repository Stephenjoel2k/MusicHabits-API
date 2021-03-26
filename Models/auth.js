//For the refresh tokens
const {spotify} = require('./spotify')

//set refresh token
const {store_refresh_token, store_recently_played, getRecentlyPlayed, get_all_tracks} = require('../Db/user');

  //
  /**
   * if unable to generate access token then we need to delete the user
   * Here we not only generate an access token but also make sure the user's recent is added to DB
   * @param {string} refresh_token 
   */
  var updateUsersTracks = async(refresh_token) => {
    const refreshBody = querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    });
    const req = request(
      {
        // Assuming you have this setup as: https://accounts.spotify.com/api/token
        url: "https://accounts.spotify.com/api/token", 
        method: 'POST',
        headers:{
          // Authorization: Basic <base64 encoded client_id:client_secret>
          'Authorization':'Basic ' + (new Buffer.from(
            process.env.CLIENT_ID + ':' +  process.env.CLIENT_SECRET
        ).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(refreshBody)
        }
      },
      (err, res) => {
        if (res) {
          const resData = JSON.parse(res.body);
          // Set new access tokens
          access_token = resData.access_token;
          //get user
          //get recentlyPlayed
          //store the recentlyPlayed
          spotify.getUserProfile(access_token).then(user => {
            var user_id = user.id;
            var name = user.display_name;
            getRecentlyPlayed(access_token, user_id).then(tracks => {
              store_recently_played(user_id, tracks).then(async()=> {
                console.log(name + " -> saved songs.")
              })
            })
          });
        } else if (err) {
          //unable to generate an access token
          //delete user?
        }
      }
    );
    //Why? Can we remove this?
    req.write(refreshBody);
  }

  
module.exports = { updateUsersTracks }
