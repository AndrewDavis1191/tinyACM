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
db.serialize(function(err, result) {
  db.run('CREATE TABLE IF NOT EXISTS users(first_name text, last_name text, badge_number BIGINT PRIMARY KEY)');
  db.run(`INSERT INTO users(first_name,last_name,badge_number)
          VALUES('Karl','Dandleton',5555555555),
                ('Bobson','Dugnutt',1123345566),
                ('Glennalon','Mixon',3334445555),
                ('Sleve','McDichael',3433445543);
  `);
  // Create admin table
  db.run('CREATE TABLE IF NOT EXISTS admins(username TEXT PRIMARY KEY, password TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS journal(messagetype TEXT, date DATE, message TEXT, badge_number BIGINT )');
  console.log(err)
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
const navbarMenu = document.getElementById('navbar-menu');
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
const kioskBtn = document.getElementById('kiosk-mode-button');
const adminButton = document.getElementById('admin-button');
const tableContainer = document.getElementById('table-cont');
const adminTableContainer = document.getElementById('admin-table-cont');
const userContainer = document.getElementById('user-input-cont');
const aboutButton = document.getElementById('about-button');
const aboutModal = document.getElementById('about-modal');
const errorModal = document.getElementById('error-modal');
const errorModalBackground = document.getElementById('error-modal-background');
const errorNotification = document.getElementById('error-notification');
const aboutModalCloseButton = document.getElementById('about-modal-close-button');
const aboutModalBackground = document.getElementById('about-modal-background');
const securityEntryModal = document.getElementById('security-entry-modal');
const securityEntryModalButton = document.getElementById('security-entry-button');
const securityEntryModalUsername = document.getElementById('security-entry-name-field');
const securityEntryModalPassword = document.getElementById('security-entry-pass-field');
const securityEntryModalPassword2 = document.getElementById('security-entry-pass-field2');
const securityEntryModalCloseButton = document.getElementById('security-entry-modal-close-button');
const securityEntryModalBackground = document.getElementById('security-entry-modal-background');
const securityExitModal = document.getElementById('security-exit-modal');
const securityExitModalButton = document.getElementById('security-exit-button');
const securityExitModalUsername = document.getElementById('security-exit-name-field');
const securityExitModalPassword = document.getElementById('security-exit-pass-field');
const securityExitModalCloseButton = document.getElementById('security-exit-modal-close-button');
const securityExitModalBackground = document.getElementById('security-exit-modal-background');
const exportUsersButton = document.getElementById('export-users-button');
const tableBody = document.getElementById('tbody');
const adminTableBody = document.getElementById('admin-tbody');
const fname_cell = document.getElementById('first-name-field');
const lname_cell = document.getElementById('last-name-field');
const badge_cell = document.getElementById('badge-num-field');
const kioskFooterItems = document.getElementById('kiosk-footer-items');
const kioskPlusButton = document.getElementById('kiosk-plus-button');
const kioskMinusButton = document.getElementById('kiosk-minus-button');
const normalFooterItems = document.getElementById('normal-footer-items');
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

// Error Modal close on background click
errorModalBackground.onclick = function() {
  hide(errorModal)
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
kioskPlusButton.onclick = function () {
  showing++;
  showColumns();
};
kioskMinusButton.onclick = function () {
  showing--;
  showColumns();
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
  const replacer = (key, value) => value === null ? '' : value
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
      errorNotification.innerText = `There are no users in the database to export.
                                      Please add users before exporting.`
      show(errorModal)
    }
    else {
      exportCsvFile(result);
    }
  });
};

// Show an element
const show = function(elem) {
	elem.style.display = 'block'
};

// Hide an element
const hide = function(elem) {
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
    fname_cell.className = "input is-danger"
    errorNotification.innerText = 'First Name must contain only letters and cannot be blank.'
    show(errorModal)
  }
  else if (lname_cell.value.length === 0 || /[^\D]\d|\W/gi.test(lname_cell.value)) {
    errorNotification.innerText = 'Last Name must contain only letters and cannot be blank.'
    show(errorModal)
    lname_cell.className = "input is-danger"
  }
  else if (badge_cell.value.length === 0 || /([^(\w|\X)]|\D)/gi.test(badge_cell.value)) {
    errorNotification.innerText = 'Badge must contain only numbers and cannot be blank.'
    show(errorModal)
    badge_cell.className = "input is-danger"
  }
  else {
    let row = tableBody.insertRow();
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
      console.log('entering kiosk mode');
      kioskBtn.innerText = "Exit Kiosk Mode"
      //window.setSize(1045, 770, true)
      hide(navbarMenu);
      hide(addUserBtn);
      hide(userContainer);
      hide(deleteUserBtn);
      hide(fileInput_button);
      hide(normalFooterItems);
      show(kioskFooterItems);
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
            errorNotification.innerText = 'Username must not be blank.'
            show(errorModal)
            securityExitModalUsername.className = "input is-danger"
          }
          else if (securityExitModalPassword.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityExitModalPassword.value)) {
            errorNotification.innerText = 'Password must not be blank'
            show(errorModal)
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
                show(navbarMenu);
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
        show(navbarMenu);
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
    errorNotification.innerText = 'Username must consist of only words and numbers.'
    show(errorModal)
    securityEntryModalUsername.className = "input is-danger"
  }
  else if (securityEntryModalPassword.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityEntryModalPassword.value)) {
    errorNotification.innerText = 'Password cannot be blank.'
    show(errorModal)
    securityEntryModalPassword.className = "input is-danger"
  }
  else if (securityEntryModalPassword.value !== securityEntryModalPassword2.value) {
    errorNotification.innerText = 'Passwords do not match.'
    show(errorModal)
    securityEntryModalPassword2.className = "input is-danger"
  }
  else {
    // Encrypt
    let row = adminTableBody.insertRow();
    let cell = row.insertCell(0);
    cell.innerHTML = `${securityEntryModalUsername.value}`
    let ciphertext = Crypto.AES.encrypt(securityEntryModalPassword.value, key).toString();
    db.run(`INSERT INTO admins(username,password)
            VALUES('${securityEntryModalUsername.value}',
            '${Crypto.AES.encrypt(securityEntryModalPassword.value, key)}')
    `, function(err, result) {
      if (err) {
        errorNotification.innerText = 'An administrator has already registered with this username.'
        show(errorModal)
      }
      else {
        // Close Security Entry modal
        show(adminTableContainer);
        securityEntryModalUsername.value = "";
        securityEntryModalPassword.value = "";
        securityEntryModalPassword2.value = "";
        securityEntryModalUsername.className = "input";
        securityEntryModalPassword.className = "input";
        securityEntryModalPassword2.className = "input";
      }
    });
  }
};

// File input function
const fileInput = document.querySelectorAll('#file-js-example input[type=file]');
fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    db.serialize(function() {
      db.run('DROP TABLE users');
      console.log('users table removed')
      db.run('CREATE TABLE users(first_name text, last_name text, badge_number BIGINT)');
      console.log('users table created')
    });
    let dataArray = [];
    const fileName = document.getElementById('file-js-example .file-name');
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
let table = document.getElementById("table"),rIndex;
for (let i = 1, len = table.rows.length; i < len; i++) {
  table.rows[i].onclick = function(){
    let table = document.getElementById("table"),rIndex;
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

// Kiosk Swipe and Show add/remove grid function
let grid = document.getElementById('grid');
let columns = Array.prototype.slice.call(document.querySelectorAll('#grid > .column'), 0);
let showing = 4;
function showColumns() {
  showing = Math.min(Math.max(parseInt(showing), 1), 8);
  columns.forEach(function (el) {
    el.style.display = 'none';
  });
  columns.slice(0, showing).forEach(function (el) {
    el.style.display = 'block';
  });
};
