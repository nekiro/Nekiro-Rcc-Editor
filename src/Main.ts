import { BrowserWindow, Menu, dialog, shell, app } from 'electron';
import { loadRcc, saveRcc, extractToPng } from './reader';
import path from 'path';
require('./ipc/main');

export default class Main {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow: any;

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      Main.application.quit();
    }
  }

  private static createWindow() {
    Main.mainWindow = new Main.BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      title: "Nekiro's Rcc Editor",
      show: false,
    });

    const template = [
      {
        label: 'Load rcc',
        click: async () => {
          const result: Electron.OpenDialogReturnValue =
            await dialog.showOpenDialog(Main.mainWindow, {
              defaultPath: path.join(
                app.getPath('appData'),
                '../Local/Tibia/packages/Tibia/bin'
              ),
              properties: ['openFile'],
              filters: [{ name: 'Rcc File Type', extensions: ['rcc'] }],
            });

          if (!result.canceled) {
            loadRcc(result.filePaths.pop() ?? null);
          }
        },
      },
      {
        label: 'Extract assets',
        click: async () => {
          const result: Electron.OpenDialogReturnValue =
            await dialog.showOpenDialog(Main.mainWindow, {
              properties: ['openDirectory', 'createDirectory'],
            });

          if (!result.canceled) {
            extractToPng(result.filePaths.pop() ?? null);
          }
        },
      },
      {
        label: 'Save rcc',
        click: () => saveRcc(),
      },
      {
        label: 'Save rcc as',
        click: async () => {
          const result = await dialog.showSaveDialog(Main.mainWindow, {
            filters: [{ name: 'Rcc File Type', extensions: ['rcc'] }],
          });

          if (!result.canceled) {
            saveRcc(result.filePath);
          }
        },
      },
      {
        label: 'Donate',
        click: () => shell.openExternal('https://github.com/sponsors/nekiro'),
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  private static onReady() {
    // create window
    Main.createWindow();

    // load layout
    Main.mainWindow.loadURL(`file://${__dirname}/html/index.html`);

    // show when its ready
    Main.mainWindow.webContents.once('did-finish-load', () => {
      Main.mainWindow.show();
    });

    //Main.mainWindow.webContents.openDevTools();
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);
  }
}
