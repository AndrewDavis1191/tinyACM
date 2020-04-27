const { remote } = require('electron');
const { crypto } = require("cryptojs");
const { dialog } = remote;
const { createReadStream,writeFile } = require('fs');
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
  db.run('CREATE TABLE IF NOT EXISTS users(first_name text, last_name text, badge_number BIGINT PRIMARY KEY)');
  db.run(`INSERT INTO users(first_name,last_name,badge_number)
          VALUES('Karl','Dandleton',5555555555),
                ('Bobson','Dugnutt',1123345566),
                ('Glennalon','Mixon',3334445555),
                ('Sleve','McDichael',3433445543);
  `);
  // Create admin table
  db.run('CREATE TABLE IF NOT EXISTS admins(username TEXT PRIMARY KEY, password TEXT)', function(err, result) {
    console.log(result)
  });
});

// close the database connection
//db.close((err) => {
//  if (err) {
//    return console.error(err.message);
//  }
//  console.log('Close the database connection.');
//});

// Encryption Key
const keysentence = 'Now you’re looking for the secret, but you won’t find it, because of course you’re not really looking. You don’t really want to know. You want to be fooled.'
const keyarray = keysentence.split(' ');
const arr = keyarray.filter(function(entry) { return entry.length > 2; });
const word = arr[Math.floor(Math.random() * arr.length)].split('').reverse().join('');
arr.splice(arr.indexOf(word),1,word);
const key = arr.sort(() => Math.floor(Math.random() * Math.floor(3)) - 1).join(' ');

// Get elements from html
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
const kioskBtn = document.getElementById('kiosk-mode-button');
const adminButton = document.getElementById('admin-button');
const tableContainer = document.getElementById('table-cont');
const userContainer = document.getElementById('user-input-cont');
const aboutButton = document.getElementById('about-button');
const aboutModal = document.getElementById('about-modal');
const aboutModalCloseButton = document.getElementById('about-modal-close-button');
const aboutModalBackground = document.getElementById('about-modal-background');
const securityEntryModal = document.getElementById('security-entry-modal');
const securityEntryModalButton = document.getElementById('security-entry-button');
const securityEntryModalUsername = document.getElementById('security-entry-name-field');
const securityEntryModalPassword = document.getElementById('security-entry-pass-field');
const securityEntryModalCloseButton = document.getElementById('security-entry-modal-close-button');
const securityEntryModalBackground = document.getElementById('security-entry-modal-background');
const securityExitModal = document.getElementById('security-exit-modal');
const securityExitModalButton = document.getElementById('security-exit-button');
const securityExitModalUsername = document.getElementById('security-exit-name-field');
const securityExitModalPassword = document.getElementById('security-exit-pass-field');
const securityExitModalCloseButton = document.getElementById('security-exit-modal-close-button');
const securityExitModalBackground = document.getElementById('security-exit-modal-background');
const exportUsersButton = document.getElementById('export-users-button');
const table_body = document.getElementById("tbody");
const fname_cell = document.getElementById("first-name-field");
const lname_cell = document.getElementById("last-name-field");
const badge_cell = document.getElementById("badge-num-field");
const kioskFooterItems = document.getElementById("kiosk-footer-items");
const normalFooterItems = document.getElementById("normal-footer-items");
const fileInput_button = document.getElementById('file-js-example');

// Add Event Listeners
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
// About Modal feature
aboutButton.onclick = function() {
  aboutModal.className = "modal is-active"
};
// About Modal close
aboutModalCloseButton.onclick = function() {
  aboutModal.className = "modal"
};
// About Modal close on background click
aboutModalBackground.onclick = function() {
  aboutModal.className = "modal"
};

// Security Modal Button
adminButton.onclick = function() {
  securityEntryModal.className = "modal is-active"
};
// Security Modal close
securityEntryModalCloseButton.onclick = function() {
  securityEntryModal.className = "modal"
};
// Security Modal close on background click
securityEntryModalBackground.onclick = function() {
  securityEntryModal.className = "modal"
};

// Security Modal close
securityExitModalCloseButton.onclick = function() {
  securityExitModal.className = "modal"
};
// Security Modal close on background click
securityExitModalBackground.onclick = function() {
  securityExitModal.className = "modal"
};

// Press Add Button on Enter in badge field
document.getElementById('badge-num-field')
.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
      addUserBtn.click();
  }
});

// Press Confirm Button on Enter in Security Entry Modal
document.getElementById('security-entry-pass-field')
.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
      securityEntryModalButton.click();
  }
});

// Press Confirm Button on Enter in Security Exit Modal
document.getElementById('security-exit-pass-field')
.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
      securityExitModalButton.click();
  }
});

// Export data function
async function exportCsvFile(json) {
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(json[0])
  let csv = json.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')
  const filePath = await dialog.showSaveDialog({
    defaultPath: `file-${Date.now()}.csv`
  });
  writeFile(filePath.filePath, csv, () => console.log('csv saved successfully'))
};

// Export Users
exportUsersButton.onclick = function() {
  db.all('SELECT * FROM users;)', function(err, result) {
    if (result.length === 0) {
      console.log('There are no users in the database to export')
    }
    else {
      exportCsvFile(result);
    }
  });
};

// Show an element
const show = function (elem) {
	elem.style.display = 'block'
};

// Hide an element
const hide = function (elem) {
	elem.style.display = 'none'
};

// Search Feature
let searchInput = document.getElementById('search-input');
searchInput.addEventListener('keyup', filterUsers);
function filterUsers(){
  let filterValue = document.getElementById('search-input').value.toUpperCase();
  let table = document.getElementById('table');
  for(let i = 1;i < table.rows.length;i++){
    let row = table.rows[i];
    if(row.innerHTML.toUpperCase().indexOf(filterValue) > -1){
      row.style.display = ''
    }
    else {
      row.style.display = 'none'
    }
  };
};

// Add user to database and javaScript table
addUserBtn.onclick = function() {
  // Validate text inputs
  if (fname_cell.value.length === 0 || /[^\D]\d|\W/gi.test(fname_cell.value)) {
    console.log("First Name can not contain a number");
    fname_cell.className = "input is-danger"
  }
  else if (lname_cell.value.length === 0 || /[^\D]\d|\W/gi.test(lname_cell.value)) {
    console.log("Last Name can not contain a number");
    lname_cell.className = "input is-danger"
  }
  else if (badge_cell.value.length === 0 || /([^(\w|\X)]|\D)/gi.test(badge_cell.value)) {
    console.log("Badge must be a number");
    badge_cell.className = "input is-danger"
  }
  else {
    let row = table_body.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.innerHTML = `${fname_cell.value}`
    cell2.innerHTML = `${lname_cell.value}`
    cell3.innerHTML = `${badge_cell.value}`
    console.log('adding user');
    db.serialize(function() {
      db.run(`INSERT INTO users(first_name,last_name,badge_number)
              VALUES('${fname_cell.value}','${lname_cell.value}','${badge_cell.value}');
      `);
      db.all('SELECT * FROM users', function(err, result) {
          console.log(result);
      });
    });
    fname_cell.value = ""
    lname_cell.value = ""
    badge_cell.value = ""
    fname_cell.className = "input"
    lname_cell.className = "input"
    badge_cell.className = "input"
    row.onclick = function() {
      if (this.className === "is-selected") {
        this.className = ""
        badge = ""
        rindex = ""
        console.log("no item selected");
      }
      else {
        this.className = "is-selected"
        badge = this.cells[2].innerText;
        console.log(badge);
      }
    };
  }
};
// Delete user from database and javaScript table
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
  const window = remote.getCurrentWindow();
  // Entering Kiosk Mode
  if (kioskBtn.innerText !== "Exit Kiosk Mode") {
    db.all('SELECT * FROM admins', function(err, result) {
      console.log(result);
      if (result.length === 0) {
        console.log('entering kiosk mode');
        kioskBtn.innerText = "Exit Kiosk Mode"
        //window.setSize(1045, 770, true)
        hide(addUserBtn);
        hide(userContainer);
        hide(deleteUserBtn);
        hide(fileInput_button);
        hide(normalFooterItems);
        show(kioskFooterItems);
      }
      else {
        // Security Modal feature
        securityEntryModal.className = "modal is-active"
      }
    });
  }
  else if (kioskBtn.innerText !== "Kiosk Mode") {
    // Exiting Kiosk Mode
    db.all('SELECT * FROM admins', function(err, result) {
    console.log(result);
      if (result.length > 0) {
        securityExitModal.className = "modal is-active"
        securityExitModalButton.onclick = function() {
          // Validate text inputs
          if (securityExitModalUsername.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityExitModalUsername.value)) {
            console.log("Username can not contain special characters");
            securityExitModalUsername.className = "input is-danger"
          }
          else if (securityExitModalPassword.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityExitModalPassword.value)) {
            console.log("Password cannot contain unicode");
            securityExitModalPassword.className = "input is-danger"
          }
          else {
              // Check db and validate password
              db.all(`SELECT * FROM admins
                WHERE username = '${securityExitModalUsername.value}'`, function(err, result){
                console.log(result);
                // Decrypt result
                let bytes = Crypto.AES.decrypt(result[0].password, key);
                let originalText = bytes.toString(Crypto.charenc.UTF8);
                if (originalText === securityExitModalPassword.value) {
                  // Security Modal close
                  console.log('exiting kiosk mode')
                  kioskBtn.innerText = "Kiosk Mode"
                  //window.setSize(1045, 615, true)
                  show(addUserBtn);
                  show(userContainer);
                  show(deleteUserBtn);
                  show(fileInput_button);
                  show(normalFooterItems);
                  hide(kioskFooterItems);
                  // Security Exit Modal close
                  securityExitModal.className = "modal"
                  securityExitModalUsername.value = ""
                  securityExitModalPassword.value = ""
                  securityExitModalUsername.className = "input"
                  securityExitModalPassword.className = "input"
                }
                else if (originalText !== securityExitModalPassword) {
                  securityExitModalUsername.className = "input is-danger"
                  securityExitModalPassword.className = "input is-danger"
                }
              });
          }
        };
      }
      else if (result.length === 0) {
        console.log('exiting kiosk mode')
        kioskBtn.innerText = "Kiosk Mode";
        //window.setSize(1045, 615, true);
        show(addUserBtn);
        show(userContainer);
        show(deleteUserBtn);
        show(fileInput_button);
        show(normalFooterItems);
        hide(kioskFooterItems);
      }
    });
  }
};

// Security entry modal function
securityEntryModalButton.onclick = function() {
  // Validate text inputs
  if (securityEntryModalUsername.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityEntryModalUsername.value)) {
    console.log("Username can not contain special characters");
    securityEntryModalUsername.className = "input is-danger"
  }
  else if (securityEntryModalPassword.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityEntryModalPassword.value)) {
    console.log("Password cannot contain unicode");
    securityEntryModalPassword.className = "input is-danger"
  }
  else {
    // Encrypt
    let ciphertext = Crypto.AES.encrypt(securityEntryModalPassword.value, key).toString();
    db.run(`INSERT INTO admins(username,password)
            VALUES('${securityEntryModalUsername.value}',
            '${Crypto.AES.encrypt(securityEntryModalPassword.value, key)}')
    `, function(err, result) {
      if (err) {
        console.log('A username already exists with that name')
        console.log(err)
      }
      else {
        // Close Security Entry modal
        securityEntryModal.className = "modal";
        securityEntryModalUsername.value = "";
        securityEntryModalPassword.value = "";
        securityEntryModalUsername.className = "input";
        securityEntryModalPassword.className = "input";
      }
    });
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
let table = document.querySelector("#table"),rIndex;
for (let i = 0, len = table.rows.length; i < len; i++) {
  table.rows[i].onclick = function(){
    let table = document.querySelector("#table"),rIndex;
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
