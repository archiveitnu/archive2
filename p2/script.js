const fs = require('fs');

const filePath = "data.json";

fs.readFile(filePath, 'utf-8', (err, data) => {
  if(err){
    console.log("Error reading file", err);
    return;
  }

  try{
    const jsonObject = JSON.parse(data);
    console.log(jsonObject);
    console.log("Formatted JSON object content", JSON.stringify(jsonObject, null, 2));
  } catch(parseError){
    console.log("Error parsing JSON", parseError);
  }
})