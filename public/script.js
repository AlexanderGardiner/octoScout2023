fields = [];
elementsNames = [];
elements = [];
function initalizeFields() {
  div = document.getElementById("input");
  for (let i = 0; i < fields.length; i++) {
    var name = document.createElement("p");
    name.innerHTML = fields[i].name;
    elementsNames.push(fields[i].name);
    div.appendChild(name);
    if (fields[i].type == "text") {
      elements.push(document.createElement("input"));
      elements[i].type = "text";
      elements[i].id = fields[i].name;
      div.appendChild(elements[i]);

    } if (fields[i].type == "increment") {
      elements.push(document.createElement("input"));
      elements[i].type = "number";
      elements[i].id = fields[i].name;
      elements[i].value = 0;
      div.appendChild(elements[i]);

      var decrementButton = document.createElement("button");
      decrementButton.innerHTML = "-";
      div.insertBefore(decrementButton, elements[i]);
      decrementButton.setAttribute("onclick", 'decrementInput("' + fields[i].name + '")');

      var incrementButton = document.createElement("button");
      incrementButton.innerHTML = "+";
      div.appendChild(incrementButton);
      incrementButton.setAttribute("onclick", 'incrementInput("' + fields[i].name + '")');
    } else if (fields[i].type == "choice") {
      elements.push(document.createElement("select"));
      elements[i].type = "checkbox";
      elements[i].id = fields[i].name;
      div.appendChild(elements[i]);

      for (let j = 0; j < fields[i].choices.length; j++) {
        var option = document.createElement("option");
        option.value = fields[i].choices[j];
        option.text = fields[i].choices[j];
        elements[i].appendChild(option)
      }
    } 

    div.appendChild(document.createElement("br"));

  }
  
  for (let i = 0; i < fields.length; i++) {
    elementsNames.push(fields[i].name+" Points");
  }
  var exportButton = document.createElement("button");
  exportButton.innerHTML = "Export as CSV";
  exportButton.setAttribute("onclick", "exportFields()");

  var uploadButton = document.createElement("button");
  uploadButton.innerHTML = "Upload to server";
  uploadButton.setAttribute("onclick", "uploadMatch()");

  var clearButton = document.createElement("button");
  clearButton.innerHTML = "Clear Fields";
  clearButton.setAttribute("onclick", "clearData()");

  var getScoutingDataButton = document.createElement("button");
  getScoutingDataButton.innerHTML = "Get Scouting Data";
  getScoutingDataButton.setAttribute("onclick", "getScoutingData()");

  uploadButton.style["margin-top"] = "8px";
  exportButton.style["margin-top"] = "8px";
  clearButton.style["margin-top"] = "8px";
  getScoutingDataButton.style["margin-top"] = "8px";

  div.appendChild(exportButton);
  div.appendChild(uploadButton);
  div.appendChild(document.createElement("br"));
  div.appendChild(clearButton);
  div.appendChild(getScoutingDataButton);
}

function incrementInput(inputID) {
  document.getElementById(inputID).value = parseInt(document.getElementById(inputID).value) + 1;
}

function decrementInput(inputID) {
  document.getElementById(inputID).value = parseInt(document.getElementById(inputID).value) - 1;
}
getFields();


function getFields() {
  fetch("/getFields", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json())
  .then((data) => {
    fields = data;
    initalizeFields();
  });
}
function exportFields() {
  elementsValues = [];
  elementsValues = getElementsValues();
  csvData = [elementsNames, elementsValues];
  downloadCSV(csvData);
}

function getElementsValues() {
  elementsValues = [];
  // Numbers
  for (i = 0; i < elements.length; i++) {
    if (fields[i].type == "text") {
      elementsValues.push(elements[i].value);
    } else if (fields[i].type == "increment") {
      elementsValues.push(parseInt(elements[i].value));
    } else if (fields[i].type == "choice") {
      elementsValues.push(elements[i].value);
      
    }
  }

  // Points
  for (i = 0; i < elements.length; i++) {
    if (fields[i].type == "text") {
      elementsValues.push(elements[i].value);
    } else if (fields[i].type == "increment") {
      elementsValues.push(parseInt(elements[i].value) * fields[i].points);
    } else if (fields[i].type == "choice") {
      for (let j = 0; j < fields[i].choices.length; j++) {
        if (fields[i].choices[j] == elements[i].value) {
          elementsValues.push(fields[i].points[j]);
        }
      }
      
    }
  }
  return elementsValues;
}

function downloadCSV(rows) {
  let csvContent = "data:text/csv;charset=utf-8,"
    + rows.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  var fileName = elements[0].value + "-" + elements[1].value + "-" + elements[3].value;
  link.setAttribute("download", fileName);
  div.appendChild(link);

  link.click();
}

function uploadMatch() {
  elementsValues = [];
  elementsValues = getElementsValues();
  csvData = [elementsNames, elementsValues];
  jsonData = { data: csvData };
  fetch("/uploadMatch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonData),
  }).then(response => {
    if (response.status == 200) {
      alert("Match Uploaded");
    } else {
      alert("Upload Failed");
    }
  })

}

function clearData() {
  document.getElementById("input").innerHTML = '';
  elements.length = 0;
  initalizeFields();
}

function getScoutingData() {
  window.location.href = "/data.csv";
}