export interface Image {
  name: string;
  path: string;
  isImage: boolean;
  data: Buffer;
}

export interface ImageBuffer {
  index: number;
  data: Buffer;
}
