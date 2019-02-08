const { getAccessToken } = require('../../services/auth');
const { oas } = require('../../../settings');
const { readFile } = require('fs');

window.fetch = (function monkey(fetch) {
  const server = function (url) {
    for (const rx of oas.servers.map((s => new RegExp(s)))) {
      if (rx.test(url)) { return true; }
    }
    return false;
  };
  const authorize = function (url, opts, ...args) {
    return getAccessToken().then((token) => {
      opts = opts !== undefined
        ? opts : {};
      opts.headers = opts.headers !== undefined
        ? opts.headers : {};
      opts.headers.Authorization
        = opts.headers.Authorization !== undefined
          ? opts.headers.Authorization : `Bearer ${token}`;
      return fetch.apply(this, [url, opts, ...args]);
    });
  };
  return function (url, ...args) {
    if (url && server(url)) {
      return authorize(url, ...args);
    } else if (/^file:\/\//.test(url)) {
      return new Promise((resolve, reject) => {
        readFile(url.slice(7), 'utf8', (error, text) => {
          if (!error) {
            resolve(new Response(text));
          } else {
            reject(error);
          }
        });
      })
    } else {
      return fetch.apply(this, [url, ...args]);
    }
  };
}(fetch));
