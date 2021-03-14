const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;


var load_all_tracks = async(user_id) => {
    const url = process.env.MONGO_URI;
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const dbName = user_id;
    const collectionName = "recently-played";
    
    try{
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        const tracks = [];
        await col.find({}).forEach(track => tracks.push(track));
        return tracks;
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}


var load_recently_played = async(user_id, earliestSongInList) => {
    const url = process.env.MONGO_URI;
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const dbName = user_id;
    const collectionName = "recently-played";
    
    try{
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        const times = [];
        await col.find({ "played_at" : { $gt : new Date(earliestSongInList)} }).forEach(time => {times.push(time.played_at)});
        return times;
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

var insert_recently_played = async(user_id, tracks) => {
    if(tracks.length < 1){
        return;
    } 
    const url = process.env.MONGO_URI;
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const dbName = user_id;
    const collectionName = "recently-played";
    
    try{
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection(collectionName);

        //using the played_at as the unique key
        await col.createIndex( { "played_at": 1 }, { unique: true } )
        for(let i = 0; i < tracks.length; i++){
            await col.insertOne(tracks[i]);
        }
        return;
    } catch (err) {
        
        if( err && err.code === 11000 ) {
            return;
        }
        else{
            console.log(err.stack);
        }

    } finally {
        await client.close();
    }
}

module.exports = { load_recently_played, insert_recently_played, load_all_tracks }

