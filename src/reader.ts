import { dialog, BrowserWindow, app } from 'electron';
import path from 'path';
import util from 'util';
const execFile = util.promisify(require('child_process').execFile);
import fs from 'fs-extra';
import Main from './Main';
import { Image } from './types';

let loadedFilePath: string | null = null;
let images: Image[] = [];

const imageExt: Array<string> = ['.png', '.jpg'];

const resourcePath: string = app.isPackaged ? process.resourcesPath : __dirname;
const localPath: string = path.resolve(resourcePath, 'rcc');

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

export async function loadRcc(filePath: string | null): Promise<void> {
  if (!filePath) {
    return;
  }

  // clear previous images
  images = [];

  // delete res directory
  if (fs.existsSync(path.join(localPath, 'qresource'))) {
    await fs.rmdir(path.join(localPath, 'qresource'), { recursive: true });
  }

  await fs.copyFile(filePath, path.join(localPath, 'res.rcc'));

  await execFile(path.join(localPath, 'rcc.exe'), ['--reverse'], {
    cwd: `${localPath}/`,
  });

  // get directory content
  const files: any[] = await getFiles(
    path.join(localPath, 'qresource', 'res', 'res.rcc')
  );

  for (const file of files) {
    images.push({
      name: path.parse(file.name).name,
      path: path.relative(
        path.join(localPath, 'qresource', 'res', 'res.rcc'),
        file.path
      ),
      isImage: imageExt.includes(path.extname(file.path)),
      data: Buffer.from(await fs.readFile(file.path, 'binary'), 'binary'),
    });
  }

  // sort by name
  images.sort((a, b) => a.name.localeCompare(b.name));

  // cleanup
  await fs.rmdir(path.join(localPath, 'qresource'), { recursive: true });
  await fs.rm(path.join(localPath, 'res.rcc'));

  loadedFilePath = filePath;

  BrowserWindow.getAllWindows()[0].webContents.send('populate-list', images);
}

export async function extractToPng(
  directoryPath: string | null
): Promise<void> {
  if (!images.length) {
    dialog.showErrorBox('Error', 'Nothing to extract.');
    return;
  }

  for (const image of images) {
    if (image.isImage) {
      await fs.outputFile(
        path.join(directoryPath as string, image.path),
        image.data
      );
    }
  }

  dialog.showMessageBox(Main.mainWindow, {
    message: `Png images extracted successfully. Extracted ${images.length} images.`,
    type: 'info',
  });
}

export async function saveRcc(
  filePath: string | null = loadedFilePath
): Promise<void> {
  if (!filePath || images.length === 0) {
    return;
  }

  // create .qrc file
  let data = '<!DOCTYPE RCC><RCC version="1.0">\n<qresource>\n';

  for (const image of images) {
    data += `<file>${image.path}</file>\n`;
  }

  data += '</qresource>\n</RCC>';

  await fs.outputFile(path.join(localPath, 'res', 'res.qrc'), data);

  // dump images
  for (const image of images) {
    await fs.outputFile(path.join(localPath, 'res', image.path), image.data);
  }

  await execFile(
    path.join(localPath, 'rcc.exe'),
    [
      '--format-version',
      '1',
      '--binary',
      './res/res.qrc',
      '-o',
      './res/res_output.rcc',
    ],
    {
      cwd: `${localPath}/`,
    }
  );

  await fs.move(path.join(localPath, '/res/res_output.rcc'), filePath, {
    overwrite: true,
  });

  // cleanup
  await fs.rmdir(path.join(localPath, 'res'), {
    recursive: true,
  });

  dialog.showMessageBox(Main.mainWindow, {
    message: 'Rcc saved successfully.',
    type: 'info',
  });
}

export async function replaceImage(
  index: number,
  filePath: string
): Promise<Buffer | null> {
  const image = images[index];
  if (!image) {
    return null;
  }

  image.data = Buffer.from(await fs.readFile(filePath, 'binary'), 'binary');
  return image.data;
}

export function getImageByIndex(index: number): Buffer {
  return images[index]?.data;
}
