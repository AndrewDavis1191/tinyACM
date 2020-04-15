const { fs, remote } = require('electron');
const { Menu } = remote;

// Function here to perform on-click operations

// Buttons
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
addUserBtn.onclick = console.log('suh');


let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// SqlLite Stuff
db.serialize(function() {
  db.run(`CREATE TABLE IF NOT EXISTS users(first_name TEXT NOT NULL,last_name TEXT NOT NULL, badge_number INTEGER PRIMARY KEY);
          INSERT INTO users(first_name, last_name, badge_number) VALUES (Rick,Grimes,5555555555), (Daryl,Dixon,1123345566), (Glen,Rhee,3334445555);
         `);
  db.all("SELECT * FROM users", function(err, result) {
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
