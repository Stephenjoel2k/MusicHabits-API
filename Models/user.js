const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

var load_recently_played = async(user_id) => {
    const url = process.env.MONGO_URI;
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const dbName = user_id;
    const collectionName = "recently-played";
    
    try{
        await client.connect();
        const db = client.db(dbName);
        const col = client.collection(collectionName);
        const tracks = [];
        await col.find({}).forEach(track => tracks.push(track));
        return tracks;
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

module.exports = { load_recently_played }

