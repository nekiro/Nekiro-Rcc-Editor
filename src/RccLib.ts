import { app, dialog } from 'electron';
import path from 'path';
import util from 'util';
const execFile = util.promisify(require('child_process').execFile);
import fs from 'fs-extra';
import Main from './main';
import Image from './types/image';

const imageExt: Array<string> = ['.png', '.jpg'];

// TODO: refactor this method
const getFiles = async (path = './') => {
  const entries = await fs.readdir(path, { withFileTypes: true });
  const files = entries
    .filter((file: any) => !file.isDirectory())
    .map((file: any) => ({ ...file, path: path + file.name }));

  const folders = entries.filter((folder: any) => folder.isDirectory());
  for (const folder of folders) {
    files.push(...(await getFiles(`${path}/${folder.name}/`)));
  }
  return files;
};

export default class RccLib {
  static images: Image[] = [];
  static loadedFilePath: string | undefined = undefined;
  static localPath: string = path.resolve(
    app.isPackaged ? process.resourcesPath : __dirname,
    'rcc'
  );

  public static async loadRcc(filePath?: string): Promise<void> {
    if (!filePath) {
      return;
    }

    // clear previous images
    this.images = [];

    // delete res directory
    if (fs.existsSync(path.join(this.localPath, 'qresource'))) {
      await fs.rmdir(path.join(this.localPath, 'qresource'), {
        recursive: true,
      });
    }

    await fs.copyFile(filePath, path.join(this.localPath, 'res.rcc'));

    await execFile(path.join(this.localPath, 'rcc.exe'), ['--reverse'], {
      cwd: `${this.localPath}/`,
    });

    // get directory content
    const files: any[] = await getFiles(
      path.join(this.localPath, 'qresource', 'res', 'res.rcc')
    );

    for (const file of files) {
      this.images.push({
        name: path.parse(file.name).name,
        path: path.relative(
          path.join(this.localPath, 'qresource', 'res', 'res.rcc'),
          file.path
        ),
        isImage: imageExt.includes(path.extname(file.path)),
        data: Buffer.from(await fs.readFile(file.path, 'binary'), 'binary'),
      });
    }

    // sort by name
    this.images.sort((a, b) => a.name.localeCompare(b.name));

    // cleanup
    await fs.rmdir(path.join(this.localPath, 'qresource'), { recursive: true });
    await fs.rm(path.join(this.localPath, 'res.rcc'));

    this.loadedFilePath = filePath;

    Main.mainWindow.webContents.send('populate-list', this.images);
  }

  public static async extractToPng(directoryPath?: string): Promise<void> {
    if (!directoryPath || !this.images.length) {
      dialog.showErrorBox('Error', 'Nothing to extract.');
      return;
    }

    for (const image of this.images) {
      if (image.isImage) {
        await fs.outputFile(
          path.join(directoryPath as string, image.path),
          image.data
        );
      }
    }

    dialog.showMessageBox(Main.mainWindow, {
      message: `Png images extracted successfully. Extracted ${this.images.length} images.`,
      type: 'info',
    });
  }

  public static async saveRcc(
    filePath: string | undefined = this.loadedFilePath
  ): Promise<void> {
    if (!filePath || this.images.length === 0) {
      return;
    }

    // create .qrc file
    let data = '<!DOCTYPE RCC><RCC version="1.0">\n<qresource>\n';

    for (const image of this.images) {
      data += `<file>${image.path}</file>\n`;
    }

    data += '</qresource>\n</RCC>';

    await fs.outputFile(path.join(this.localPath, 'res', 'res.qrc'), data);

    // dump images
    for (const image of this.images) {
      await fs.outputFile(
        path.join(this.localPath, 'res', image.path),
        image.data
      );
    }

    await execFile(
      path.join(this.localPath, 'rcc.exe'),
      [
        '--format-version',
        '1',
        '--binary',
        './res/res.qrc',
        '-o',
        './res/res_output.rcc',
      ],
      {
        cwd: `${this.localPath}/`,
      }
    );

    await fs.move(path.join(this.localPath, '/res/res_output.rcc'), filePath, {
      overwrite: true,
    });

    // cleanup
    await fs.rmdir(path.join(this.localPath, 'res'), {
      recursive: true,
    });

    dialog.showMessageBox(Main.mainWindow, {
      message: 'Rcc saved successfully.',
      type: 'info',
    });
  }

  public static async replaceImage(
    index: number,
    filePath: string
  ): Promise<Buffer | null> {
    const image = this.images[index];
    if (!image) {
      return null;
    }

    image.data = Buffer.from(await fs.readFile(filePath, 'binary'), 'binary');
    return image.data;
  }

  public static getImageByIndex(index: number): Buffer {
    return this.images[index]?.data;
  }
}
