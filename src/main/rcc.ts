import { app } from 'electron';
import path from 'path';
import { execFile as execFileSync, ExecFileOptions } from 'child_process';
import fs from 'fs/promises';
import { Image } from '../types/Image';

const images: Image[] = [];
const localPath = path.resolve(
  app.isPackaged ? process.resourcesPath : __dirname,
  'rcc',
);
let loadedFilePath: string | undefined;

const getAllFiles = async function (
  dirPath: string,
  arrayOfFiles: string[] = [],
) {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    if ((await fs.stat(dirPath + '/' + file)).isDirectory()) {
      arrayOfFiles = await getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  }

  return arrayOfFiles;
};

const execFile = (
  command: string,
  args: string[] = [],
  options: ExecFileOptions,
) => {
  return new Promise<string>((resolve, reject) =>
    execFileSync(command, args, options, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout.trim());
    }),
  );
};

export const loadRcc = async (filePath?: string) => {
  if (!filePath) {
    return [];
  }

  // clear previous images
  images.length = 0;

  // delete res directory
  const qresourcePath = path.join(localPath, 'qresource');

  try {
    await fs.rm(qresourcePath, {
      recursive: true,
    });
  } catch {
    // silently ignore
  }

  // copy to directory
  await fs.copyFile(filePath, path.join(localPath, 'res.rcc'));

  await execFile(path.join(localPath, 'rcc.exe'), ['--reverse'], {
    cwd: `${localPath}/`,
  });

  const files = await getAllFiles(path.join(qresourcePath, 'res', 'res.rcc'));
  if (!files) return [];

  for (const file of files) {
    const fileInfo = path.parse(file);

    images.push({
      name: fileInfo.name,
      fullName: fileInfo.name + fileInfo.ext,
      path: file.substring(file.indexOf('qresource')),
      data: Buffer.from(await fs.readFile(file, 'binary'), 'binary'),
    });
  }

  // sort by name
  images.sort((a, b) => a.name.localeCompare(b.name));

  // cleanup
  await fs.rm(path.join(localPath, 'qresource'), { recursive: true });
  await fs.rm(path.join(localPath, 'res.rcc'));

  loadedFilePath = filePath;
  return images;
};

export const saveRcc = async (
  filePath: string | undefined = loadedFilePath,
) => {
  if (!filePath || images.length === 0) {
    return;
  }

  // create .qrc file
  let data = '<!DOCTYPE RCC><RCC version="1.0">\n<qresource>\n';

  for (const image of images) {
    data += `<file>${image.path.substring(
      image.path.indexOf('res.rcc'),
    )}</file>\n`;

    const relativePath = path.join(localPath, image.path);

    await fs.mkdir(path.dirname(relativePath), { recursive: true });
    await fs.writeFile(relativePath, image.data);
  }

  data += '</qresource>\n</RCC>';

  await fs.writeFile(path.join(localPath, 'qresource', 'res', 'res.qrc'), data);

  console.log(localPath);

  await execFile(
    path.join(localPath, 'rcc.exe'),
    [
      '--format-version',
      '1',
      '--binary',
      './qresource/res/res.qrc',
      '-o',
      './qresource/res_output.rcc',
    ],
    {
      cwd: `${localPath}/`,
    },
  );

  console.log(path.join(localPath, 'res_output.rcc'));

  await fs.cp(path.join(localPath, 'qresource', 'res_output.rcc'), filePath, {
    force: true,
  });

  // cleanup
  await fs.rm(path.join(localPath, 'qresource'), {
    recursive: true,
  });

  // dialog.showMessageBox(mainWindow, {
  //   message: 'Rcc saved successfully.',
  //   type: 'info',
  // });
};

export const extractToPng = async (directoryPath: string) => {
  if (!directoryPath || images.length === 0) {
    return { success: false };
  }

  for (const image of images) {
    await fs.writeFile(
      path.join(directoryPath as string, image.fullName),
      image.data,
    );
  }

  return { success: true, count: images.length };
};

export const replaceImage = async (index: number, filePath: string) => {
  if (!filePath) return null;

  const image = getImageByIndex(index);
  if (!image) {
    return null;
  }

  image.data = Buffer.from(await fs.readFile(filePath, 'binary'), 'binary'); // TODO check this
  return image;
};

export const getImageByIndex = (index: number) => {
  return images[index];
};

export const getImages = () => images;
