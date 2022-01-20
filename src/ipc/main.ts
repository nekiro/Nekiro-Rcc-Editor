const { ipcMain } = require('electron');
import { getImageByIndex, replaceImage } from '../reader';

ipcMain.on('get-image-data', (event: Electron.IpcMainEvent, index: number) => {
  event.reply('update-preview', getImageByIndex(index));
});

ipcMain.on('replace-image', async (event: Electron.IpcMainEvent, obj) => {
  const data = await replaceImage(obj.index, obj.path);
  if (data) {
    event.reply('update-preview', data);
    event.reply('update-miniature', { index: obj.index, data });
  }
});
