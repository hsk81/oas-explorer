const { menu } = require('../../../settings');
const { Menu } = require('electron');
const { shell } = require('electron');

class AppMenu {
  register(app_window) {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate(this.template(app_window)));
  }
  template(app_window) {
    const template = [
      {
        label: 'API Explorer',
        submenu: [
          {
            accelerator: 'CommandOrControl+I',
            click() {
              app_window.run('editor-import');
            },
            label: 'Import from URL...',
            registerAccelerator: true
          },
          { type: 'separator' },
          {
            accelerator: 'CommandOrControl+O',
            click() {
              app_window.run('editor-open');
            },
            label: 'Open File...',
            registerAccelerator: true
          },
          {
            accelerator: 'CommandOrControl+S',
            click() {
              app_window.run('editor-save');
            },
            label: 'Save',
            registerAccelerator: true
          },
          {
            accelerator: 'CommandOrControl+Shift+S',
            click() {
              app_window.run('editor-save-as');
            },
            label: 'Save As...',
            registerAccelerator: true
          },
          { type: 'separator' },
          {
            accelerator: 'CommandOrControl+Shift+Q',
            click() {
              app_window.run('app-logout');
            },
            label: 'Logout',
            registerAccelerator: true
          },
          {
            registerAccelerator: true, role: 'quit'
          },
        ]
      },
      {
        label: 'Edit',
        role: 'edit',
        submenu: [
          {
            accelerator: 'CommandOrControl+Z',
            click() {
              app_window.run('editor-undo');
            },
            label: 'Undo',
            registerAccelerator: true
          },
          {
            accelerator: 'CommandOrControl+Shift+Z',
            click() {
              app_window.run('editor-redo');
            },
            label: 'Redo',
            registerAccelerator: true
          },
          { type: 'separator' },
          { registerAccelerator: true, role: 'cut' },
          { registerAccelerator: true, role: 'copy' },
          { registerAccelerator: true, role: 'paste' },
          { registerAccelerator: true, role: 'delete' },
          { registerAccelerator: true, role: 'selectall' },
          { type: 'separator' },
          {
            click() {
              app_window.run('editor-reset');
            },
            label: 'Reset',
          },
        ]
      },
      {
        label: 'View',
        role: 'view',
        submenu: [
          {
            accelerator: 'CommandOrControl+E',
            click() {
              app_window.run('editor-toggle');
            },
            label: 'Toggle Editor',
            registerAccelerator: true
          },
          { type: 'separator' },
          { registerAccelerator: true, role: 'reload' },
          { registerAccelerator: true, role: 'forcereload' },
          { registerAccelerator: true, role: 'toggledevtools' },
          { type: 'separator' },
          { registerAccelerator: true, role: 'resetzoom' },
          { registerAccelerator: true, role: 'zoomin' },
          { registerAccelerator: true, role: 'zoomout' },
          { type: 'separator' },
          { registerAccelerator: true, role: 'togglefullscreen' }
        ]
      },
      {
        role: 'window',
        submenu: [
          { registerAccelerator: true, role: 'minimize' },
          { registerAccelerator: true, role: 'close' }
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            click() {
              shell.openExternal(menu.help.learnmore_url);
            },
            label: 'Learn More'
          },
          {
            click() {
              shell.openExternal(menu.help.documentation_url);
            },
            label: 'Documentation'
          },
          {
            click() {
              shell.openExternal(menu.help.community_url);
            },
            label: 'Community Discussions'
          },
          {
            click() {
              shell.openExternal(menu.help.issues_url);
            },
            label: 'Search Issues'
          },
          { type: 'separator' },
          {
            click() {
              app_window.run('app-about');
            },
            label: 'About',
          },
        ]
      }
    ];
    if (process.platform === 'darwin') {
      template[0] = { // explorer menu
        label: 'API Explorer',
        submenu: [
          { registerAccelerator: true, role: 'about' },
          { type: 'separator' },
          { registerAccelerator: true, role: 'services' },
          { type: 'separator' },
          { registerAccelerator: true, role: 'hide' },
          { registerAccelerator: true, role: 'hideothers' },
          { registerAccelerator: true, role: 'unhide' },
          { type: 'separator' },
          { registerAccelerator: true, role: 'quit' }
        ]
      };
      template[3].submenu = [ // window menu
        { registerAccelerator: true, role: 'close' },
        { registerAccelerator: true, role: 'minimize' },
        { registerAccelerator: true, role: 'zoom' },
        { type: 'separator' },
        { registerAccelerator: true, role: 'front' }
      ]
    }
    return template;
  }
}
module.exports = {
  AppMenu
};
