const { app, shell, BrowserWindow, dialog } = require('electron');
const path = require('path');
//app.showExitPrompt = true

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
    icon: __dirname + '/../images/icon.png',
    webPreferences: {
      nodeIntegration: true,
    }
  });
  //mainWindow.on('close', (e) => {
  //  if (app.showExitPrompt) {
  //    e.preventDefault() // Prevents the window from closing
  //    dialog.showMessageBox({
  //      type: 'question',
  //      buttons: ['Yes', 'No'],
  //      title: 'Confirm',
  //      message: 'Unsaved data will be lost. Are you sure you want to quit?'
  //    }, function(response) {
  //      if (response === 0) { // Runs the following if 'Yes' is clicked
  //        console.log('closing app')
  //        app.showExitPrompt = false
  //        mainWindow.destroy();
  //        app.quit();
  //      }
  //    });
  //  }
  //});

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("new-window", function(event, url) {
    event.preventDefault();
    shell.openExternal(url);
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
