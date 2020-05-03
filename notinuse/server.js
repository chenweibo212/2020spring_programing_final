// server.js

// init project
const express = require('express');
const app = express();
const trackRoute = express.Router();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const mongodb = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const filePath = path.join(__dirname, './testFile/hole.aiff');
const dbName = 'soundfromMAX';

const maxApi = require("max-api");

maxApi.post("Hello from node!");

//data from max to node
// let maxfilename;
// maxApi.addHandler('input', (message) => {
//     maxApi.post(`received from max ${message}`);
//     maxfilename = message;

//     if(maxfilename != null){
//       let filefromMax = path.join(__dirname, './testFile/', maxfilename);

//       mongodb.MongoClient.connect(mongoUri, function(error, client){
//         assert.ifError(error);
//         const db = client.db(dbName);
//         let bucket = new mongodb.GridFSBucket(db);
//         fs.createReadStream(filefromMax).
//           //add data to upload filename
//           pipe(bucket.openUploadStream('test_fromMAX.aiff')).
//             on('error', function(error){
//               assert.ifError(error);
//             }).
//             on('finish', function(){
//               console.log('done!');
//               maxApi.post('upload done!');
//             })
//       })    
//     }
// })

let dbclient, bucket;
mongodb.MongoClient.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((client)=>{
  dbclient = client.db(dbName);
  bucket = new mongodb.GridFSBucket(dbclient);
})

//data from max to node
let maxfilename;
maxApi.addHandler('input', (message) => {
    maxApi.post(`received from max ${message}`);
    maxfilename = message;

    if(maxfilename != null){
      let filefromMax = path.join(__dirname, './testFile/', maxfilename);
          fs.createReadStream(filefromMax).
          //add data to upload filename
          pipe(bucket.openUploadStream(maxfilename)).
            on('error', function(error){
              assert.ifError(error);
            }).
            on('finish', function(){
              console.log('done!');
              maxApi.post('upload done!');
            }) 
    }
})

// Special piece for running with webpack dev server
if (process.env.NODE_ENV === "development") {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const config = require('../webpack.dev.config.js');
  const compiler = webpack(config);

  // Tell express to use the webpack-dev-middleware and use the webpack.config.js
  // configuration file as a base.
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// get songstream from mongodbGridfs

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + '/app/index.html');
});

app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});