const { app, Menu, BrowserWindow, dialog, shell } = require("electron");
const { loadRcc, saveRcc, extractToPng } = require("./js/reader");
require("./js/ipcMain");

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
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
      label: "Load rcc",
      click: async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ["openFile"],
          filters: [{ name: "Rcc File Type", extensions: ["rcc"] }],
        });

        if (!result.canceled) {
          loadRcc(result.filePaths.pop());
        }
      },
    },
    {
      label: "Extract assets",
      click: async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ["openDirectory", "createDirectory"],
        });

        if (!result.canceled) {
          extractToPng(result.filePaths.pop());
        }
      },
    },
    {
      label: "Save rcc",
      click: () => saveRcc(),
    },
    {
      label: "Save rcc as",
      click: async () => {
        const result = await dialog.showSaveDialog(mainWindow, {
          filters: [{ name: "Rcc File Type", extensions: ["rcc"] }],
        });

        if (!result.canceled) {
          saveRcc(result.filePath);
        }
      },
    },
    {
      label: "Donate",
      click: () => shell.openExternal("https://github.com/sponsors/nekiro"),
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(`file://${__dirname}/html/index.html`);

  mainWindow.webContents.once("did-finish-load", () => {
    mainWindow.show();
  });

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  return mainWindow;
};

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
