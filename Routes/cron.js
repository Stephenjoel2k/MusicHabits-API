/**
 * This route is only for the cron task.
 */

const express = require('express')
const router = express.Router()

const { getNewAccessToken } = require('../Models/auth');
const { db } = require('../Models/db');  
const { spotify } = require('../Models/spotify');
const { filter } = require('../Models/filter');
   

/**
 * Cron task to update all user's recent tracks
 */
router.get('/update', async (req, res) => {

  res.status(200).json({
    success: true,
    message: "User Data is being updated!",
  });

  try{
    const user_tokens = await db.getAllUserTokens(); 
    for(let i = 0; i < user_tokens.length; i++){
      const refresh_token = user_tokens[i].refresh_token;
      const data = await getNewAccessToken(refresh_token);
  
      //If User hasn't revoked permission for their access token
      if(data.access_token){
        const access_token = data.access_token;
        const recents = await spotify.getUserRecentlyPlayed(access_token);
        const tracks = filter.dbRecentTracks(recents.items);
        await db.putTracks(access_token, tracks);
      }else{
        //Delete user's access token/data
      }
    }
    
  } catch (err){
    console.log(err.stack);
    return res.status(401).json({
      success: false,
      message: "Failed to update user data",
    });
  }
    
})

module.exports = router