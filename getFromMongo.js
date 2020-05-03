const express = require('express');

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";



const app = express();
const trackRoute = express.Router();
app.use('/tracks', trackRoute);

const dbName = 'soundfromMAX';
let dbclient;
MongoClient.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((client)=>{
  console.log('connected!')
  dbclient = client.db(dbName);
})

trackRoute.get('/:_id', (req, res) => {
  try {
    var _id = new ObjectID(req.params._id);
  } catch(err) {
    return res.status(400).json({ message: "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }
  // res.set('Content-Type', 'audio/aiff');
  // res.set('Accept-Ranges', 'bytes');

  let bucket = new mongodb.GridFSBucket(dbclient, {
    bucketName: 'fs'
  });

  let downloadStream = bucket.openDownloadStream(_id);

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('error', () => {
    res.sendStatus(404);
  });

  downloadStream.on('end', () => {
    res.end();
  });
});

app.listen(3005, () => {
  console.log("App listening on port 3005!");
});