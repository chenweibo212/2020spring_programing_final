const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const mongodb = require("mongodb");
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, './maxpatch/hksoundscape.mp3');
const dbName = 'soundfromMAX';

const maxApi = require("max-api");

maxApi.post("Hello from node!");

let dbclient, bucket;
mongodb.MongoClient.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((client)=>{
  dbclient = client.db(dbName);
  bucket = new mongodb.GridFSBucket(dbclient);
})

//data from max to mongoDB
let maxfilename;
maxApi.addHandler('input', (message) => {
    maxApi.post(`received from max ${message}`);
    maxfilename = message;
	
    if(maxfilename != null){
      let filefromMax = path.join(__dirname, maxfilename);
 	  maxApi.post("in here");
          fs.createReadStream(filefromMax).
          //add data to upload filename
          pipe(bucket.openUploadStream(maxfilename)).
            on('error', function(error){
              assert.ifError(error);
            }).
            on('finish', function(file){
              console.log('done!');
              maxApi.post(`upload done with _id: ${file._id}`);
            }) 
    }
})

//export this module