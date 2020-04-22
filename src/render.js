const { remote } = require('electron');
const { createReadStream,createWriteStream } = require('fs');
const { parse } = require('fast-csv');
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

const fnameField = document.getElementById("first-name-field");
fnameField.onclick = function() {
  if (this.className !== "input") {
    this.className = "input"
  }
};
const lnameField = document.getElementById("last-name-field");
lnameField.onclick = function() {
  if (this.className !== "input") {
    this.className = "input"
  }
};
const badgeNumField = document.getElementById("badge-num-field");
badgeNumField.onclick = function() {
  if (this.className !== "input") {
    this.className = "input"
  }
};

// Grab elements for later use
const tableContainer = document.getElementById('table-cont');
const userContainer = document.getElementById('user-input-cont');
const aboutButton = document.getElementById('about-button')
const aboutModal = document.getElementById('about-modal')
const aboutModalCloseButton = document.getElementById('about-modal-close-button')
const aboutModalBackground = document.getElementById('about-modal-background')
const table_body = document.getElementById("tbody");
const fname_cell = document.getElementById("first-name-field");
const lname_cell = document.getElementById("last-name-field");
const badge_cell = document.getElementById("badge-num-field");

// About Modal feature
aboutButton.onclick = function() {
  aboutModal.className = "modal is-active"
};
// About Modal close
aboutModalCloseButton.onclick = function() {
  aboutModal.className = "modal"
}
// About Modal close on background click
aboutModalBackground.onclick = function() {
  aboutModal.className = "modal"
}

// Search Feature
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
  // Validate text inputs
  if (/[^\D]\d|\W/gi.test(fname_cell.value)) {
    console.log("First Name can not contain a number");
    fname_cell.className = "input is-danger"
  }
  else if (/[^\D]\d|\W/gi.test(lname_cell.value)) {
    console.log("Last Name can not contain a number");
    lname_cell.className = "input is-danger"
  }
  else if (/([^(\w|\X)]|\D)/gi.test(badge_cell.value)) {
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
    fname_cell.className = "input";
    lname_cell.className = "input";
    badge_cell.className = "input";
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
// Show an element
const show = function (elem) {
	elem.style.display = 'block';
};

// Hide an element
const hide = function (elem) {
	elem.style.display = 'none';
};

kioskBtn.onclick = function() {
  const window = remote.getCurrentWindow();
  if (window.isKiosk() === false) {
    console.log('entering kiosk mode');
    window.setKiosk(true);
    kioskBtn.innerText = "Exit Kiosk Mode"
    hide(addUserBtn);
    hide(userContainer);
    hide(tableContainer);
    hide(deleteUserBtn);
    hide(fileInput);
  }
  else if (window.isKiosk() === true) {
    console.log('exiting kiosk mode')
    window.setKiosk(false);
    kioskBtn.innerText = "Kiosk Mode"
    show(addUserBtn);
    show(userContainer);
    show(tableContainer);
    show(deleteUserBtn);
    show(fileInput);
  }
};

// File input function
const fileInput = document.querySelector('#file-js-example input[type=file]');
fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    db.serialize(function() {
      db.run('DROP TABLE users');
      console.log('users table removed')
      db.run('CREATE TABLE users(first_name text, last_name text, badge_number BIGINT)');
      console.log('users table created')
    });
    let dataArray = [];
    const fileName = document.querySelector('#file-js-example .file-name');
    fileName.textContent = fileInput.files[0].name;
    createReadStream(fileInput.files[0].path)
    .pipe(parse())
    .on('data', (row) => {
      dataArray.push(row);
      let tableRow = table_body.insertRow();
      let cell1 = tableRow.insertCell(0);
      let cell2 = tableRow.insertCell(1);
      let cell3 = tableRow.insertCell(2);
      cell1.innerHTML = `${row[0]}`;
      cell2.innerHTML = `${row[1]}`;
      cell3.innerHTML = `${row[2]}`;
      db.serialize(function() {
        db.run(`INSERT INTO users(first_name,last_name,badge_number)
                VALUES('${row[0]}','${row[1]}',${row[2]});
        `);
      })
    })
    .on('error', error => console.error(error))
    .on('end', () => {
      console.log('CSV file successfully processed');
      fileName.textContent = "";
    });
  }
};

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
