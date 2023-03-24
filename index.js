const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

fields = [{ name: "Team Number", type: "text" },
{ name: "Match Number", type: "text" },
{ name: "Team Color", type: "choice", choices: ["Red", "Blue"], points: ["Red", "Blue"] },
{ name: "Scout Initals", type: "text" },
{ name: "Cone High Auto", type: "increment", points: 6 },
{ name: "Cone Mid Auto", type: "increment", points: 4 },
{ name: "Cone Low Auto", type: "increment", points: 3 },
{ name: "Cube High Auto", type: "increment", points: 6 },
{ name: "Cube Mid Auto", type: "increment", points: 4 },
{ name: "Cube Low Auto", type: "increment", points: 3 },
{ name: "Mobility Auto", type: "choice", choices: ["None", "Attempted Mobility", "Mobility"], points: [0, 0, 3] },
{ name: "Balance Auto", type: "choice", choices: ["None", "Attempted", "Docked", "Engaged"], points: [0, 0, 0, 8, 12] },
{ name: "Cones Collected", type: "increment", points: 1 },
{ name: "Cubes Collected", type: "increment", points: 1 },
{ name: "Cone High Teleop", type: "increment", points: 5 },
{ name: "Cone Mid Teleop", type: "increment", points: 3 },
{ name: "Cone Low Teleop", type: "increment", points: 2 },
{ name: "Cube High Teleop", type: "increment", points: 5 },
{ name: "Cube Mid Teleop", type: "increment", points: 3 },
{ name: "Cube Low Teleop", type: "increment", points: 2 },
{ name: "Endgame Teleop", type: "choice", choices: ["None", "Park", "Docked", "Engaged"], points: [0, 2, 6, 10] },
{ name: "Notes", type: "text" }];

gridFields = [
{ name: "Team Number", type: "text" },
{ name: "Match Number", type: "text" },
{ name: "Team Color", type: "choice", choices: ["Red", "Blue"], points: ["Red", "Blue"] },
{ name: "Scout Initals", type: "text" },
{name: "Pieces Placed Auto", type: "checkbox grid", grid: [[6, 6, 6, 6, 6, 6, 6, 6, 6],
  [4, 4, 4, 4, 4, 4, 4, 4, 4],
  [3, 3, 3, 3, 3, 3, 3, 3, 3]],
  rowNames: ["Top", "Middle", "Bottom"], colors: [["#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00"],
  ["#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00"],
  ["#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00"]],
  categories: [[0, 3, 0, 0, 3, 0, 0, 3, 0],
  [1, 4, 1, 1, 4, 1, 1, 4, 1],
  [2, 5, 2, 2, 5, 2, 2, 5, 2]],
  categoriesNames: ["Cone High Auto","Cone Mid Auto", "Cone Low Auto", "Cube High Auto", "Cube Mid Auto", "Cube Low Auto"]
},
{ name: "Mobility Auto", type: "choice", choices: ["None", "Attempted Mobility", "Mobility"], points: [0, 0, 3] },
{ name: "Balance Auto", type: "choice", choices: ["None", "Attempted", "Docked", "Engaged"], points: [0, 0, 0, 8, 12] },
{ name: "Cones Collected", type: "increment", points: 1 },
{ name: "Cubes Collected", type: "increment", points: 1 },
{
  name: "Pieces Placed", type: "checkbox grid", grid: [[5, 5, 5, 5, 5, 5, 5, 5, 5],
  [3, 3, 3, 3, 3, 3, 3, 3, 3],
  [2, 2, 2, 2, 2, 2, 2, 2, 2]],
  rowNames: ["Top", "Middle", "Bottom"], colors: [["#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00"],
  ["#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00"],
  ["#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00", "#fffb00", "3700ff", "#fffb00"]],
  categories: [[0, 3, 0, 0, 3, 0, 0, 3, 0],
  [1, 4, 1, 1, 4, 1, 1, 4, 1],
  [2, 5, 2, 2, 5, 2, 2, 5, 2]], categoriesNames: ["Cone High","Cone Mid", "Cone Low", "Cube High", "Cube Mid", "Cube Low"]
},
{ name: "Endgame Teleop", type: "choice", choices: ["None", "Park", "Docked", "Engaged"], points: [0, 2, 6, 10] },
{ name: "Notes", type: "text" }];

app.post('/uploadMatch', (req, res) => {
  uploadedData = req.body.data;
  data = readFromCSV();
  data.push(uploadedData[1]);
  writeToCSV(convert2DArrayToCSV(data))

  res.sendStatus(200);
});

app.post('/uploadGridMatch', (req, res) => {
  uploadedData = req.body.data;
  data = readFromGridCSV();
  data.push(uploadedData[1]);
  writeToGridCSV(convert2DArrayToCSV(data));
  data.pop();

  uploadedDataAsPoints = [];
  i = 0;
  uploadedDataI = 0;

  while (i < gridFields.length) {
    if (gridFields[i].type == "text") {
      uploadedDataAsPoints.push(uploadedData[1][uploadedDataI]);
      uploadedDataI++;
    } else if (gridFields[i].type == "increment") {
      uploadedDataAsPoints.push(parseInt(uploadedData[1][uploadedDataI]) * gridFields[i].points);
      uploadedDataI++;
    } else if (gridFields[i].type == "choice") {
      for (let j = 0; j < gridFields[i].choices.length; j++) {
        if (gridFields[i].choices[j] == uploadedData[1][uploadedDataI]) {
          uploadedDataAsPoints.push(gridFields[i].points[j]);
        }
      }
      uploadedDataI++;

    } else if (gridFields[i].type == "checkbox grid") {
      categoriesPointsSums = Array(gridFields[i].categoriesNames.length).fill(0);
      for (let j = 0; j < gridFields[i].categories.length; j++) {
        for (let k = 0; k < gridFields[i].categories[j].length; k++) {
          if (uploadedData[1][uploadedDataI]) {
            categoriesPointsSums[gridFields[i].categories[j][k]] += gridFields[i].grid[j][k];
            
          }
          uploadedDataI++;



        }
      }

      for (let j = 0; j < gridFields[i].categoriesNames.length; j++) {
        uploadedDataAsPoints.push(categoriesPointsSums[j]);

      }

    }
    i++;
    
    
  }

  ogPoints = readFromPointsCSV();
  ogPoints.push(uploadedDataAsPoints)
  writeToPointsCSV(convert2DArrayToCSV(ogPoints));





  uploadedDataAsCount = [];
  i = 0;
  uploadedDataI = 0;

  while (i < gridFields.length) {
    console.log("I: "+i);
    console.log("UploadedI"+uploadedDataI);
    console.log(uploadedDataAsCount)
    if (gridFields[i].type == "text") {
      uploadedDataAsCount.push(uploadedData[1][uploadedDataI]);
      uploadedDataI++;
    } else if (gridFields[i].type == "increment") {
      uploadedDataAsCount.push(parseInt(uploadedData[1][uploadedDataI]));
      uploadedDataI++;
    } else if (gridFields[i].type == "choice") {
      uploadedDataAsCount.push(uploadedData[1][uploadedDataI]);
      uploadedDataI++;

    } else if (gridFields[i].type == "checkbox grid") {
      categoriesCountsSums = Array(gridFields[i].categoriesNames.length).fill(0);
      for (let j = 0; j < gridFields[i].categories.length; j++) {
        for (let k = 0; k < gridFields[i].categories[j].length; k++) {
          if (uploadedData[1][uploadedDataI]) {
            categoriesCountsSums[gridFields[i].categories[j][k]] += 1;
            
          }
          uploadedDataI++;



        }
      }

      for (let j = 0; j < gridFields[i].categoriesNames.length; j++) {
        uploadedDataAsCount.push(categoriesCountsSums[j]);

      }

    }
    i++;
    
    
  }

  ogCount = readFromCountCSV();
  ogCount.push(uploadedDataAsCount)
  writeToCountCSV(convert2DArrayToCSV(ogCount));

  res.sendStatus(200);
});

app.get('/getFields', (req, res) => {
  res.json(fields);
});

app.get('/getGridFields', (req, res) => {
  res.json(gridFields);
});

app.listen(80, () => {
  console.log('App is listening on port 80');
});


function readFromCountCSV() {
  results = [];
  data = fs.readFileSync('./public/dataAsCount.csv', 'utf8');

  const rows = data.trim().split('\n');

  for (const row of rows) {
    const values = row.split(',');
    results.push(values);
  }

  return results;

}

function readFromPointsCSV() {
  results = [];
  data = fs.readFileSync('./public/dataAsPoints.csv', 'utf8');

  const rows = data.trim().split('\n');

  for (const row of rows) {
    const values = row.split(',');
    results.push(values);
  }

  return results;

}

function readFromGridCSV() {
  results = [];
  data = fs.readFileSync('./public/dataWithGrid.csv', 'utf8');

  const rows = data.trim().split('\n');

  for (const row of rows) {
    const values = row.split(',');
    results.push(values);
  }

  return results;

}


function readFromCSV() {
  results = [];
  data = fs.readFileSync('./public/data.csv', 'utf8');

  const rows = data.trim().split('\n');

  for (const row of rows) {
    const values = row.split(',');
    results.push(values);
  }

  return results;

}
function readFromCSVWithoutHeaders() {
  results = [];
  data = fs.readFileSync('./public/dataWithoutHeaders.csv', 'utf8');

  const rows = data.trim().split('\n');
  rows.shift();
  for (const row of rows) {
    const values = row.split(',');
    results.push(values);
  }

  return results;

}


function writeToCountCSV(csv) {
  fs.writeFileSync('./public/dataAsCount.csv', csv, 'utf8');
}

function writeToPointsCSV(csv) {
  fs.writeFileSync('./public/dataAsPoints.csv', csv, 'utf8');
}

function writeToGridCSV(csv) {
  fs.writeFileSync('./public/dataAsGrid.csv', csv, 'utf8');
}




function writeToCSVWithoutHeaders(csv) {
  fs.writeFileSync('./public/dataWithoutHeaders.csv', csv, 'utf8');
}

function writeToCSV(csv) {
  fs.writeFileSync('./public/data.csv', csv, 'utf8');
}



function convert2DArrayToCSV(data) {
  return (data.map((item) => {
    var row = item;
    return row.join(",");
  }).join("\n"));
}

data = readFromCSV();
if (data == 0) {
  headers = [[]];
  for (let i = 0; i < fields.length; i++) {
    headers[0].push(fields[i].name);
  }

  for (let i = 0; i < fields.length; i++) {
    headers[0].push(fields[i].name + " Points");
  }
  writeToCSV(convert2DArrayToCSV(headers))
}


data = readFromPointsCSV();
if (data == 0) {
  headers = [[]];
  for (let i = 0; i < gridFields.length; i++) {
    if (gridFields[i].type == "checkbox grid") {
      for (let j=0; j<gridFields[i].categoriesNames.length; j++) {
        headers[0].push(gridFields[i].categoriesNames[j]);
      }
    } else {
      headers[0].push(gridFields[i].name);
    }
    
  }
  writeToPointsCSV(convert2DArrayToCSV(headers))
}

data = readFromCountCSV();
if (data == 0) {
  headers = [[]];
  for (let i = 0; i < gridFields.length; i++) {
    if (gridFields[i].type == "checkbox grid") {
      for (let j=0; j<gridFields[i].categoriesNames.length; j++) {
        headers[0].push(gridFields[i].categoriesNames[j]);
      }
    } else {
      headers[0].push(gridFields[i].name);
    }
    
  }
  writeToCountCSV(convert2DArrayToCSV(headers))
}

