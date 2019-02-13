const { getAuthorizationUrl } = require('../../services/auth');
const { setAuthorizationUrl } = require('../../services/auth');
const { requestTokens } = require('../../services/auth');

const { productName } = require('../../../package');
const { auth0 } = require('../../../settings');
const { icon } = require('../../../assets');

const { BrowserWindow } = require('electron');

class AuthWindow {
  constructor(next) {
    this.open(next);
  }
  async open(next) {
    this._window = new BrowserWindow({
      devTools: false,
      center: true,
      height: 600,
      icon: icon.png,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true
      },
      width: 372
    });
    const { session: { webRequest } } = this._window.webContents;
    const filter = { urls: [`${auth0.redirect_uri}*`] };
    webRequest.onBeforeRequest(filter, async ({ url }) => {
      const acquired = await requestTokens(url);
      setAuthorizationUrl({
        prompt: acquired ? 'none' : 'login'
      }).then(() => {
        if (typeof next === 'function') {
          next(acquired);
        }
        this.close();
      });
    });
    this._window.once('ready-to-show', () => {
      this._window.setTitle(productName);
      this._window.show();
    });
    this._window.on('authenticated', () => {
      this.close();
    });
    this._window.on('closed', () => {
      this._window = null;
    });
    this._window.setMenuBarVisibility(false);
    // this._window.webContents.openDevTools();
    this._window.loadURL(await getAuthorizationUrl());
  }
  close() {
    if (this._window) {
      this._window.close();
    }
  }
  get closed() {
    return this._window
      ? this._window.closed
      : true;
  }
}
module.exports = {
  AuthWindow
};
