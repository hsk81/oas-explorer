const { setAuthorizationUrl } = require('../../services/auth');
const { ipcRenderer, remote } = require('electron');
const pkg = require('../../../package.json');

const { app } = remote;
const { versions } = require('process');
const { kebabCase } = require('lodash');

const on_logout = (ev, ...args) => {
  setAuthorizationUrl({ prompt: 'login' }).then(() => {
    app.quit();
  });
};
const on_about = (ev, ...args) => {
  const style = (properties) => {
    return `<style ${properties.join(" ")}>
      .vex-dialog-button-primary {
        background: #61affe;
        font-weight: 700;
        text-shadow: 0 1px 0 rgba(0,0,0,.1);
        font-family: sans-serif;
        color: #fff;
        border-radius: 1px;
      }
      .about .info {
        height: 15em;
        list-style: none;
        overflow-y: auto;
      }
      .about .info {
        padding: 0;
        margin: 0;
      }
      .about .info {
        display: grid;
        grid-gap: 0.5em;
        grid-auto-rows: 2em;
      }
      .about .info .item {
        background-color: lightgray;
        border-radius: 2px;
      }
      .about .info .item div {
        align-items: center;
        display: flex;
        height: 100%;
        padding: 0 0.5em;
      }
      .about .info .item div.key {
        float: left;
      }
      .about .info .item div.value {
        float: right;
      }
      </style>`;
  };
  const cmp = (lhs, rhs) => {
    if (lhs > rhs) {
      return +1;
    }
    if (lhs < rhs) {
      return -1;
    }
    return 0;
  };
  const { description: app_description } = pkg;
  const { name: app_name } = pkg;
  const { version: app_version } = pkg;
  const info_app = Object.entries({
    app_description, app_name, app_version
  });
  const { author: { name: author_name } } = pkg;
  const { author: { email: author_email } } = pkg;
  const { author: { url: author_url } } = pkg;
  const info_author = Object.entries({
    author_name, author_email, author_url
  });
  const { license } = pkg;
  const { repository: { url: repository_url } } = pkg;
  const info_extra = Object.entries({
    license, repository_url
  });
  const info_process =
    Object.entries(versions)
      .filter(([k, v]) => k && v)
      .sort(([k1], [k2]) => cmp(k1, k2))
      .map(([k, v]) => [`process-${k}`, v]);

  const to_li = ([k, v]) => `<li class="item">
    <div class="key">${kebabCase(k)}</div>
    <div class="value">${v}</div>
  </li>`;
  vex.closeAll();
  vex.dialog.alert({
    unsafeMessage: `
    <div class="about">
      ${style(['scoped'])}
      <h1>API Explorer</h1>
      <ul class="info">
        ${info_app.sort(([k1], [k2]) =>
          cmp(k1, k2)).map(to_li).join('')}
        ${info_author.sort(([k1], [k2]) =>
          cmp(k1, k2)).map(to_li).join('')}
        ${info_extra.sort(([k1], [k2]) =>
          cmp(k1, k2)).map(to_li).join('')}
        ${info_process.sort(([k1], [k2]) =>
          cmp(k1, k2)).map(to_li).join('')}
      </ul>
    </div>
  `});
};

ipcRenderer.on('app-logout', on_logout);
ipcRenderer.on('app-about', on_about);
