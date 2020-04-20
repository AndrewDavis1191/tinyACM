const { fs, remote } = require('electron');
const { Menu } = remote;

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// SqlLite Stuff
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


// Function here to perform on-click operations

// Buttons
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
const kioskBtn = document.getElementById('kiosk-mode-button');

// Press Add Button on Enter in field three
document.getElementById('badge-num-field')
.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
      document.getElementById('add-user-button').click();
  }
});

// Button placeholders
addUserBtn.onclick = function() {
    console.log('adding user');
}
// Delete user from database and javascript table
deleteUserBtn.onclick = function() {
    db.serialize(function(err, result) {
    db.run(`DELETE FROM users
            WHERE badge_number = ${badge}`);
      console.log(result);
  });
    console.log('removing user');
}
kioskBtn.onclick = function() {
    console.log('entering kiosk mode');
}

// File input function
const fileInput = document.querySelector('#file-js-example input[type=file]');
fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    const fileName = document.querySelector('#file-js-example .file-name');
    fileName.textContent = fileInput.files[0].name;
  }
}

// Messing around interacting with table
let table = document.querySelector("#table"),rIndex;
for (let i = 0; i <= table.rows.length; i++)
  {
    table.rows[i].onclick = function()
    {
      rIndex = this.rowIndex;
      badge = this.cells[2].innerText;
      console.log(rIndex);
      console.log(badge);
    };
  }
