const { app, shell, BrowserWindow, dialog } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1045,
    height: 615,
    resizable: true,
    maximizable: true,
    autoHideMenuBar: true,
    icon: __dirname + './images/icon.png',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.on("new-window", function(event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });
  mainWindow.on('close', function(e) {
  const choice = require('electron').dialog.showMessageBoxSync(this,
    {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: `Are you sure you want to quit? Users and journal will be lost.
      Please export if there is any information you'd like to keep.`
    });
  if (choice === 1) {
    e.preventDefault();
  }
});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
