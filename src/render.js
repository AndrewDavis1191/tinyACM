// SqlLite Stuff
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:');

db.serialize(function() {
  db.run("CREATE TABLE users (info TEXT)");

  let stmt = db.prepare("INSERT INTO users VALUES (?)");
  for (let i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM users", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

db.close();


// Buttons
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
videoSelectBtn.onclick = getVideoSources;

const { fs, remote } = require('electron');
const { Menu } = remote;
