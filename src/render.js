const { fs, remote } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// Create user table and populate with starter info
db.serialize(function() {
  db.run('CREATE TABLE users(first_name text, last_name text, badge_number BIGINT)');
  db.run(`INSERT INTO users(first_name,last_name,badge_number)
          VALUES('Rick','Grimes',5555555555),
                ('Daryl','Dixon',1123345566),
                ('Glen','Rhee',3334445555),
                ('Carol','Peletier',3433445543);
  `);
  db.all('SELECT * FROM users', function(err, result) {
      console.log(result);
  });
});

// close the database connection
//db.close((err) => {
//  if (err) {
//    return console.error(err.message);
//  }
//  console.log('Close the database connection.');
//});

// Buttons
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
const kioskBtn = document.getElementById('kiosk-mode-button');

document.getElementById("first-name-field").onclick = function() {
  if (this.className !== "input") {
    this.className = "input"
  }
}
document.getElementById("last-name-field").onclick = function() {
  if (this.className !== "input") {
    this.className = "input"
  }
}
document.getElementById("badge-num-field").onclick = function() {
  if (this.className !== "input") {
    this.className = "input"
  }
}

// search feature
let searchInput = document.getElementById('search-input');
searchInput.addEventListener('keyup', filterUsers);

function filterUsers(){
  let filterValue = document.getElementById('search-input').value.toUpperCase();

  let table = document.getElementById('table');
  for(let i = 1;i < table.rows.length;i++){
    let row = table.rows[i];
    if(row.innerHTML.toUpperCase().indexOf(filterValue) > -1){
      row.style.display = '';
    }
    else {
      row.style.display = 'none';
    }
  }
}

// Press Add Button on Enter in badge field
document.getElementById('badge-num-field')
.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
      addUserBtn.click();
  }
});

// Add user to database and javascript table
addUserBtn.onclick = function() {
  let table_body = document.getElementById("tbody");
  let fname_cell = document.getElementById("first-name-field");
  let lname_cell = document.getElementById("last-name-field");
  let badge_cell = document.getElementById("badge-num-field");
  // Validate text inputs
  if (fname_cell.value === "") {
    console.log("First Name must have a value");
    fname_cell.className = "input is-danger"
  }
  else if (/\d/.test(fname_cell.value)) {
    console.log("First Name can not contain a number");
    fname_cell.className = "input is-danger"
  }
  if (lname_cell.value === "") {
    console.log("Last Name must have a value");
    lname_cell.className = "input is-danger"
  }
  else if (/\d/.test(lname_cell.value)) {
    console.log("Last Name can not contain a number");
    lname_cell.className = "input is-danger"
  }
  if (badge_cell.value === "") {
    console.log("Badge must have a value");
    badge_cell.className = "input is-danger"
  }
  else if (/\D/.test(badge_cell.value)) {
    console.log("Badge must be a number");
    badge_cell.className = "input is-danger"
  }
  else {
    let row = table_body.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.innerHTML = `${fname_cell.value}`;
    cell2.innerHTML = `${lname_cell.value}`;
    cell3.innerHTML = `${badge_cell.value}`;
    console.log('adding user');
    db.serialize(function() {
      db.run(`INSERT INTO users(first_name,last_name,badge_number)
              VALUES('${fname_cell.value}','${lname_cell.value}','${badge_cell.value}');
      `);
      db.all('SELECT * FROM users', function(err, result) {
          console.log(result);
      });
    });
    fname_cell.value = "";
    lname_cell.value = "";
    badge_cell.value = "";
  }
};
// Delete user from database and javascript table
deleteUserBtn.onclick = function() {
  let table = document.getElementById('table');
  let rowLength = table.rows.length;
  let counter = 0;

	if (table.rows.length >= 1) {
		for (let i = 0; i < table.rows.length; i++) {
			if (table.rows[i].className === "is-selected") {
        badge = table.rows[i].cells[2].innerText;
        db.serialize(function(err, result) {
        db.run(`DELETE FROM users
                WHERE badge_number = ${badge}`
        );
        console.log(result);
        });
				table.deleteRow(i);
				rowLength--;
				i--;
				counter = counter + 1;
			}
		}
		if (counter == 0) {
			console.log("Please select the row that you want to delete.");
		}
	}else {
		console.log("There are no rows to delete");
	}
};

// Kiosk mode function
kioskBtn.onclick = function() {
  console.log('entering kiosk mode');
};

// File input function
const fileInput = document.querySelector('#file-js-example input[type=file]');
fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    const fileName = document.querySelector('#file-js-example .file-name');
    fileName.textContent = fileInput.files[0].name;
  }
}

// Table selection and highlighting
document.getElementById("table").onclick = function() {
  let table = document.querySelector("#table"),rIndex;
  for (let i = 1; i < table.rows.length; i++) {
    table.rows[i].onclick = function() {
      if (this.className === "is-selected") {
        this.className = ""
        badge = ""
        rindex = ""
        console.log("no item selected");
      }
      else {
        this.className = "is-selected"
        rIndex = this.rowIndex;
        badge = this.cells[2].innerText;
        console.log(rIndex);
        console.log(badge);
      }
    };
  }
};
