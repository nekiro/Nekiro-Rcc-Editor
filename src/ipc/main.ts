const { ipcMain } = require('electron');
import RccLib from '../RccLib';

ipcMain.on('get-image-data', (event: Electron.IpcMainEvent, index: number) => {
  event.reply('update-preview', RccLib.getImageByIndex(index));
});

ipcMain.on('replace-image', async (event: Electron.IpcMainEvent, obj) => {
  const data = await RccLib.replaceImage(obj.index, obj.path);
  if (data) {
    event.reply('update-preview', data);
    event.reply('update-miniature', { index: obj.index, data });
  }
});
