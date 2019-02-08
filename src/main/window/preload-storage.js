const { Observable } = require('../functions/observable');
const { remote } = require('electron');
const { getCurrentWindow } = remote;
const { sep } = require('path');

const storage = new Observable({
  get: (...args) => localStorage.getItem(...args),
  set: (...args) => localStorage.setItem(...args)
});
storage.on('oas-url', (key, value) => {
  getCurrentWindow().setTitle(
    `API Explorer [${value.split(sep).pop()}]`
  );
});
exports.storage = storage;
