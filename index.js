const { MongoClient } = require('mongodb');
const { createObjectCsvWriter } = require('csv-writer');
require('dotenv').config();
const fs = require('fs');
const {progressBar, zipFolder, findImages} = require('./utils.js');

// Redefined console.error function for a red output
console.error = function(message){
  process.stderr.write('\x1b[31m' + message + '\x1b[0m\n');
}

console.info = function(message){
  process.stderr.write('\x1b[34m' + message + '\x1b[0m\n');
}

const auditName = process.argv[2];
if(auditName === undefined){
  console.error("No audit name provided. For example, to retrieve the audit 'test' use 'npm start test'");
  process.exit(1);
}

async function exportToCSV() {
  const client = new MongoClient(process.env.DB_URI);

  const csvWriter = createObjectCsvWriter({
    path: `${auditName}/${process.env.DB_BASE_FILENAME}.csv`,
    header: [
      {id:'title',title:'Name'},
      {id:'description',title:'Description'},
      {id:'observation',title:'Observation'},
    ]
  });
  try {
    await client.connect();
    if(!fs.existsSync(auditName)){
      fs.mkdirSync(auditName);
    }
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(process.env.DB_COLLECTION);
    console.info("=== Retreiving data from MongoDB ===");
    console.info(progressBar(0.2));
    let cursor = await collection.findOne({name: auditName},{projection: {_id:0,findings:1}});
    if(cursor == null){
      console.clear();
      console.error(`No audit found with the name : ${auditName}`);
    }else{
      cursor = cursor.findings;
      let index = 1;
      console.clear();
      console.info("=== Uploading images ===");
      console.info(progressBar(0.4));
      cursor.forEach(async (item) => {
        item.description = await findImages(item.title, index, item.description, database);
        item.observation = await findImages(item.title, index, item.observation, database);
        console.log(item.observation);
        await csvWriter.writeRecords(cursor);
        index++;
      })
    }
    console.clear();
    console.info("=== Creating CSV file & Zip file ===");
    console.info(progressBar(0.6));
    zipFolder(`${auditName}`, `${auditName}.zip`).then(() => {
      console.clear();
      console.info("=== Job done ===");
      console.info(progressBar(1));
      }).catch((error) => {
          console.error(error);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally{
    await client.close();
  }
}

exportToCSV();