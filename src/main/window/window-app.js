const { productName } = require('../../../package');
const { icon } = require('../../../assets');

const { BrowserWindow } = require('electron');
const { join } = require('path');

class AppWindow {
  constructor() {
    this.open();
  }
  open() {
    this._window = new BrowserWindow({
      devTools: false,
      height: 640,
      icon: icon.png,
      show: false,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: false,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true
      },
      width: 640
    });
    this._window.loadFile('src/index/index.html');
    this._window.once('ready-to-show', () => {
      this._window.setTitle(productName);
      this._window.show();
    });
    this._window.on('closed', () => {
      this._window = null;
    });
    // this._window.webContents.openDevTools();
  }
  close() {
    if (this._window) {
      this._window.close();
    }
  }
  run(command, ...args) {
    switch (command) {
      case 'app-about':
        this._window.webContents.send(command, ...args);
        break;
      case 'app-logout':
        this._window.webContents.session.clearStorageData([], () => {
          this._window.webContents.send(command, ...args);
        });
        break;
      case 'editor-open':
      case 'editor-save':
      case 'editor-save-as':
        this._window.webContents.send(command, ...args);
        break;
      case 'editor-import':
      case 'editor-reset':
        this._window.webContents.send(command, ...args);
        break;
      case 'editor-redo':
      case 'editor-toggle':
      case 'editor-undo':
        this._window.webContents.send(command, ...args);
        break;
      default:
        console.debug('[app-window.run]', command, ...args);
    }
  }
  get closed() {
    return this._window ? this._window.closed : true;
  }
  set title(value) {
    if (this._window) {
      this._window.setTitle(value);
    }
  }
}
module.exports = {
  AppWindow
};
