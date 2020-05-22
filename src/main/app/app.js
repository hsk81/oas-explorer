const { app } = require('electron');
const { AppMenu } = require('./app-menu');
const { AppWindow } = require('../window/window');
const { AuthWindow } = require('../window/window');
const { logout } = require('../../services/auth');
const { refreshTokens } = require('../../services/auth');
const { productName } = require('../../../package');

class App {
  constructor() {
    if (require('electron-squirrel-startup')) {
      return app.quit();
    }
    app.on('activate', this.onActivate.bind(this));
    app.once('before-quit', this.onBeforeQuit.bind(this));
    app.on('ready', this.onReady.bind(this));
    app.on('window-all-closed', this.onAllClosed.bind(this));
    app.setName(productName);
  }
  onActivate() {
    if (this._app_window.closed) {
      this._app_window.open();
    }
  }
  onAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }
  onBeforeQuit(ev) {
    setTimeout(app.quit, 3000);
    logout().then(app.quit);
    ev.preventDefault();
  }
  onReady() {
    refreshTokens().then((refreshed) => {
      if (refreshed) {
        this._app_window = new AppWindow();
        this.setMenu(this._app_window);
      } else {
        this._auth_window = new AuthWindow((acquired) => {
          if (acquired) {
            this._app_window = new AppWindow();
            this.setMenu(this._app_window);
          } else {
            app.quit();
          }
        });
      }
    });
  }
  setMenu(app_window) {
    this._menu = new AppMenu();
    this._menu.register(app_window);
  }
}
module.exports = {
  App
};
