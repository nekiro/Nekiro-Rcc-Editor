import { Image } from '../types/image';

export type RendererHandlers = {
  listImages: {
    subscribe: (
      handler: (_: Electron.IpcRendererEvent, images: Image[]) => void,
    ) => void;
    unsubscribe: () => void;
  };
  listImage: {
    subscribe: (
      handler: (
        _: Electron.IpcRendererEvent,
        index: number,
        image: Image,
      ) => void,
    ) => void;
    unsubscribe: () => void;
  };
};

export interface MainApi {
  replaceImage: (index: number, path: string) => Promise<Image>;
  getImages: () => Promise<Image[]>;
  handlers: RendererHandlers;
}

export type Image = {
  name: string;
  path: string;
  isImage: boolean;
  data: Buffer;
};

declare global {
  interface Window {
    api: MainApi;
  }
}
