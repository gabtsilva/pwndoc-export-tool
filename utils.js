const { ObjectId } = require('mongodb');
const fs = require('fs');

function removeHTML(content){
    return content === undefined  ? 'N/A' : content.replace(/<\/?[^>]+(>|$)/g,'');
}

async function findImages(auditName, title, content, db){
    const imgRegex = /<img.*?src=['"](.*?)['"].*?alt=['"](.*?)['"].*?>/g;
    let match;
    const imgcollection = db.collection('images');
    let count = 1;
    while((match = imgRegex.exec(content)) !== null){
        title = title.charAt(0) === '.' ? title.replace('.','[dot]') : title; 
        if(!fs.existsSync(`${auditName}/${title}`)){
            fs.mkdirSync(`${auditName}/${title}`);
        }
        let document = await imgcollection.findOne({_id:new ObjectId(match[1])});
        content = content.replace(match[0], ` (Proof_${'0'.repeat((3 - Math.abs(count).toString().length))}${count} - ${match[2]}) `);
        const imageData = document.value.split(';base64,').pop();
        const extension = document.value.substring(document.value.indexOf('/') + 1, document.value.indexOf(';'));
        fs.writeFile(`${auditName}/${title}/Proof_${'0'.repeat((3 - Math.abs(count).toString().length))}${count}.${extension}`,imageData,{encoding:'base64'},(err) => {});
        count++;
    }
    return removeHTML(content);
}

const cleanCVSS = (cvss) => {
    let output = "";
    // Dictionnaries generated by GPT3.5
    const abbreviationDictionary = {AV: "Attack Vector", AC: "Attack Complexity", PR: "Privileges Required", UI: "User Interaction", S: "Scope", C: "Confidentiality", I: "Integrity", A: "Availability"};
    const cvssDictionary = {AV: {N: "Network", A: "Adjacent Network", L: "Local", P: "Physical"}, AC: {H: "High", L: "Low"}, PR: {N: "None", L: "Low", H: "High"}, UI: {N: "None", R: "Required"}, S: {U: "Unchanged", C: "Changed"}, C: {N: "None", L: "Low", H: "High"}, I: {N: "None", L: "Low", H: "High"}, A: {N: "None", L: "Low", H: "High"}};
    const cvssArray = cvss.split('CVSS:3.1/')[1].split('/');
    for (let index = 0; index < 4; index++) {
        output += `${abbreviationDictionary[cvssArray[index].split(":")[0]]}:\t\t ${cvssDictionary[cvssArray[index].split(":")[0]][cvssArray[index].split(":")[1]]}\t${abbreviationDictionary[cvssArray[index+4].split(":")[0]]}:\t\t ${cvssDictionary[cvssArray[index+4].split(":")[0]][cvssArray[index+4].split(":")[1]]}\n`;
    }
    return output;
}

module.exports = {findImages, cleanCVSS, removeHTML}