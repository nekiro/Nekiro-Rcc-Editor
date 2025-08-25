import { Image } from "../types/image";

export type RendererHandlers = {
	listImages: {
		subscribe: (handler: (_: Electron.IpcRendererEvent, images: Image[]) => void) => void;
		unsubscribe: () => void;
	};
	listImage: {
		subscribe: (handler: (_: Electron.IpcRendererEvent, index: number, image: Image) => void) => void;
		unsubscribe: () => void;
	};
};

export interface MainApi {
	replaceImage: (index: number, path: string) => Promise<Image>;
	replaceImageWithData: (index: number, data: ArrayBuffer) => Promise<Image>;
	getImages: () => Promise<Image[]>;
	handlers: RendererHandlers;
}

export type Image = {
	name: string;
	fullName: string;
	path: string;
	data: Buffer | string;
};

declare global {
	interface Window {
		api: MainApi;
	}
}
