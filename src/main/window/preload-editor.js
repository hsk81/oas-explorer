const { storage } = require('./preload-storage');
const { oas } = require('../../../settings');
const { ipcRenderer } = require('electron');
const { dialog } = require('electron');

const { readFile } = require('fs');
const { writeFile } = require('fs');

const ace_editor = () => {
  return ace.edit('ace-editor');
};
const dlg_filters = () => {
  const filter_yaml = {
    name: 'YAML', extensions: ['yaml', 'yml']
  };
  const filter_json = {
    name: 'JSON', extensions: ['json']
  };
  const filters = [
    filter_yaml, filter_json
  ];
  try {
    if (JSON.parse(ace_editor().getValue())) {
      filters.length = 0;
      filters.push(filter_json);
      filters.push(filter_yaml);
    }
  }
  catch (ex) {
    // pass
  }
  return filters;
};
const to_data = (yaml, filepath) => {
  const to_json_data = (yaml) => {
    return new Uint8Array(Buffer.from(JSON.stringify(
      require('js-yaml').safeLoad(yaml, { json: true }), null, 2
    )));
  };
  const to_yaml_data = (yaml) => {
    return new Uint8Array(Buffer.from(
      yaml
    ));
  };
  return /\.json$/.test(filepath)
    ? to_json_data(yaml)
    : to_yaml_data(yaml);
};

const on_toggle = (ev, ...args) => {
  const pane_1 = document.getElementsByClassName('Pane1')[0];
  const pane_2 = document.getElementsByClassName('Pane2')[0];
  const editor = document.getElementById('ace-editor');
  if (pane_1.hidden) {
    pane_1.hidden = false;
    pane_2.style.width = '50%';
    setTimeout(() => editor.click(), 1);
  } else {
    pane_1.hidden = true;
    pane_2.style.width = '100%';
    setTimeout(() => editor.blur(), 1);
  }
};
const on_undo = (ev, ...args) => {
  ace_editor().undo();
};
const on_redo = (ev, ...args) => {
  ace_editor().redo();
};
const on_open = (ev, ...args) => {
  dialog.showOpenDialog({
    title: 'Open API Specification',
    filters: [{
      name: 'YAML', extensions: ['yaml', 'yml']
    }, {
      name: 'JSON', extensions: ['json']
    }],
    properties: ['openFile']
  }, (filepaths) => {
    if (filepaths && filepaths.length > 0) {
      if (/^file:\/\//.test(filepaths[0])) {
        filepaths[0] = filepaths[0].slice(7);
      }
      readFile(filepaths[0], 'utf8', (error, text) => {
        if (!error) {
          storage.set('oas-url', `file://${filepaths[0]}`);
          ace_editor().setValue(text, -1);
        }
      });
    }
  });
};
const on_save_as = (ev, ...args) => {
  dialog.showSaveDialog({
    defaultPath: storage.get('oas-url'),
    title: 'Save API Specification',
    filters: dlg_filters()
  }, (filepath) => {
    if (filepath) {
      if (/^file:\/\//.test(filepath)) {
        filepath = filepath.slice(7);
      }
      const yaml = ace_editor().getValue();
      const data = to_data(yaml, filepath);
      writeFile(filepath, data, (error) => {
        if (!error) {
          storage.set('oas-url', `file://${filepath}`);
        } else {
          console.error(error);
        }
      });
    }
  });
};
const on_save = (ev, ...args) => {
  let filepath = storage.get('oas-url');
  if (/^file:\/\//.test(filepath)) {
    filepath = filepath.slice(7);
  }
  const yaml = ace_editor().getValue();
  const data = to_data(yaml, filepath);
  writeFile(filepath, data, (error) => {
    if (error) on_save_as(ev, ...args);
  });
};
const on_import = (ev, ...args) => {
  vex.dialog.prompt({
    callback: (url, ...args) => {
      if (url !== false) {
        fetch(url || oas.url).then((res) => {
          return res.text();
        }).then((text) => {
          storage.set('oas-url', url || oas.url);
          ace_editor().setValue(text, -1);
        });
      }
    },
    message: 'Leave blank to import from default URL:',
    placeholder: oas.url,
    value: storage.get('oas-url', '')
  });
};
const on_reset = (ev, ...args) => {
  fetch(storage.get('oas-url') || oas.url).then((res) => {
    return res.text();
  }).then((text) => {
    ace_editor().setValue(text, -1);
  });
};

ipcRenderer.on('editor-toggle', on_toggle);
ipcRenderer.on('editor-undo', on_undo);
ipcRenderer.on('editor-redo', on_redo);
ipcRenderer.on('editor-open', on_open);
ipcRenderer.on('editor-save-as', on_save_as);
ipcRenderer.on('editor-save', on_save);
ipcRenderer.on('editor-import', on_import);
ipcRenderer.on('editor-reset', on_reset);
