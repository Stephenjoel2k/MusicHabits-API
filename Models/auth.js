const querystring = require('querystring');
const request = require('request');
require('dotenv').config();

//For the refresh tokens
const {spotify} = require('./spotify')
const {db} = require('./db');


/**
 * Must handle error cases/cases when user deletes their refresh token
 * @param {String} refresh_token 
 * @returns error/access_token 
 */
const getNewAccessToken = async(refresh_token) => {
  const refreshBody = querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
  });

  return new Promise ((resolve, reject)=>{
  request(
    {
      url: "https://accounts.spotify.com/api/token", 
      method: 'POST',
      headers:{
        // Authorization: Basic <base64 encoded client_id:client_secret>
        'Authorization':'Basic ' + (new Buffer.from(
          process.env.CLIENT_ID + ':' +  process.env.CLIENT_SECRET
      ).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(refreshBody)
      },
      body: refreshBody
    }, function(req, resp, body){
      if(!body) reject("No body");
      resolve(JSON.parse(body));
    });
  });
}

module.exports = {getNewAccessToken};