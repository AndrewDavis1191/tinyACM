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
deleteUserBtn.onclick = function() {
    console.log('removing user');
}
kioskBtn.onclick = function() {
    console.log('entering kiosk mode');
}
