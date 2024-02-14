const { MongoClient } = require('mongodb');
require('dotenv').config();
const fs = require('fs');
const {findImages, cleanCVSS, removeHTML} = require('./utils.js');

const properties = ['title','cvssv3','description','observation', 'poc', 'references', 'remediation','scope'];
const auditName = process.argv[2];

console.error = function(message){
  process.stderr.write('\x1b[31m' + message + '\x1b[0m\n');
}

console.info = function(message){
  process.stderr.write('\x1b[34m' + message + '\x1b[0m\n');
}

if(auditName === undefined){
  console.error("No audit name provided. To retrieve the audit 'test' use 'npm start test'");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(process.env.DB_URI);
  
  try {
    await client.connect();
    if(!fs.existsSync(auditName)){
      fs.mkdirSync(auditName);
    }
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(process.env.DB_COLLECTION);
    let cursor = await collection.findOne({name: auditName},{projection: {_id:0,findings:1}});
    if(cursor == null){
      console.clear();
      console.error(`No audit found with the name : ${auditName}`);
    }else{
      cursor = cursor.findings;
      cursor.forEach(async (item) => {
        item.description = removeHTML(item.description);
        item.observation = removeHTML(item.observation);
        item.poc = await findImages(auditName, item.title, item.poc, database);
        item.remediation = removeHTML(item.remediation);
        item.scope = removeHTML(item.scope);
        const stream = fs.createWriteStream(`${auditName}/${item.title.replace(/ /g,'_')}.txt`, {flags:'w'});
        properties.forEach((property) => {
          if(item.hasOwnProperty(property)){
            stream.write("=========================\n");
            let title = "";
            let text = "";
            if(property == "cvssv3"){
              title = "CVSS v3 Scoring";
              text = cleanCVSS(item[property]);
            }else if(property == "references"){
              title = property.charAt(0).toUpperCase() + property.slice(1);
              item[property].forEach((item) => {
                text += `${item}\n`;
              })
            }else{
              text = item[property];
              title = property.charAt(0).toUpperCase() + property.slice(1);
            }
            stream.write(`${title}\n`);
            stream.write("=========================\n\n");
            stream.write(`${text}\n\n`);

          }
        })
        stream.end();
      })
    }
    
  } catch (error) {
    console.error('Error:', error);
  }finally{
    console.info("Folder generated. Use Ctrl+C to close the program");
  }
}

run();