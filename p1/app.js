const fs = require('fs');

const jsonObject = {
  name: 'John Doe',
  age: 25,
  city: 'Ahmedabad',
};

const jsonString = JSON.stringify(jsonObject, null, 2);

const filePath = 'output.json';

fs.writeFile(filePath, jsonString, 'utf-8', (err)=>{
  if(err){
    console.error("Error writing to file: ", err);
  }else{
    console.log("JSON object has been stored in", filePath);
  }
});