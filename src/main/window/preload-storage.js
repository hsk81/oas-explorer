const { Observable } = require('../functions/observable');
const { ipcRenderer } = require('electron');
const { sep } = require('path');

const storage = new Observable({
  get: (...args) => localStorage.getItem(...args),
  set: (...args) => localStorage.setItem(...args)
});
storage.on('oas-url', (key, value) => ipcRenderer.send(
  'app-title', `API Explorer [${value.split(sep).pop()}]`
));
exports.storage = storage;
