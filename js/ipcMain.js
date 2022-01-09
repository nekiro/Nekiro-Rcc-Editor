const { ipcMain } = require('electron');
const { getImageByIndex, replaceImage } = require('./reader');

ipcMain.on('get-image-data', (event, index) => {
  event.reply('update-preview', getImageByIndex(index));
});

ipcMain.on('replace-image', async (event, obj) => {
  const data = await replaceImage(obj.index, obj.path);
  if (data) {
    event.reply('update-preview', data);
    event.reply('update-miniature', { index: obj.index, data });
  }
});
