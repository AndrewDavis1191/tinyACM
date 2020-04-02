const { fs, remote } = require('electron');
const { Menu } = remote;

// Function here to perform on-click operations

// Buttons
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
addUserBtn.onclick = getVideoSources;
