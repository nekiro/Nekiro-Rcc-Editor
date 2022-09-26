import { contextBridge, ipcRenderer } from 'electron';
import { MainApi, RendererHandlers } from './declarations';

const handlers: RendererHandlers = {
  listImages: {
    subscribe: (imagesHandler) => ipcRenderer.on('list:images', imagesHandler),
    unsubscribe: () => ipcRenderer.removeListener('list:images', () => true),
  },
  listImage: {
    subscribe: (handler) => ipcRenderer.on('list:image', handler),
    unsubscribe: () => ipcRenderer.removeListener('list:image', () => true),
  },
};

const api: MainApi = {
  replaceImage: (index: number, path: string) =>
    ipcRenderer.invoke('list:replace-image', index, path),
  getImages: () => ipcRenderer.invoke('list:images'),
  handlers,
};

contextBridge.exposeInMainWorld('api', api);
