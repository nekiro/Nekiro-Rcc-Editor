const { dialog, BrowserWindow, app } = require("electron");
const path = require("path");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));

let loadedFilePath = null;
let images = [];

const getResourcePath = () => {
  if (app.isPackaged) {
    return process.resourcesPath;
  } else {
    return ".";
  }
};

const getFiles = async (path = "./") => {
  const entries = await fs.readdir(path, { withFileTypes: true });
  const files = entries
    .filter((file) => !file.isDirectory())
    .map((file) => ({ ...file, path: path + file.name }));

  const folders = entries.filter((folder) => folder.isDirectory());
  for (const folder of folders) {
    files.push(...(await getFiles(`${path}/${folder.name}/`)));
  }
  return files;
};

const loadRcc = async (filePath) => {
  const localPath = `${path.resolve(getResourcePath(), "rcc")}`;

  // clear previous images
  images = [];

  // delete res directory
  try {
    await fs.rmdir(`${localPath}/qresource`, { recursive: true });
  } catch {}

  await fs.copyFile(filePath, `${localPath}/res.rcc`);

  const result = await execFile(`${localPath}/rcc.exe`, ["--reverse"], {
    cwd: `${localPath}/`,
  });

  // get directory content
  const files = await getFiles(`${localPath}/qresource/res/res.rcc`);
  for (const file of files) {
    const ext = path.extname(file.path);
    images.push({
      name: path.parse(file.name).name,
      path: path.relative(`${localPath}/qresource/res/res.rcc`, file.path),
      isImage: ext === ".png" || ext === ".jpg",
      data: Buffer.from(await fs.readFile(file.path, "binary"), "binary"),
    });
  }

  // sort by name
  images.sort((a, b) => a.name.localeCompare(b.name));

  // cleanup
  await fs.rmdir(`${localPath}/qresource`, { recursive: true });
  await fs.rm(`${localPath}/res.rcc`);

  loadedFilePath = filePath;

  BrowserWindow.getAllWindows()[0].webContents.send("populate-list", images);
};

const extractToPng = async (directoryPath) => {
  if (images.length === 0) {
    dialog.showErrorBox("Error", "Nothing to extract.");
    return;
  }

  for (const image of images) {
    if (image.isImage) {
      await fs.outputFileAsync(`${directoryPath}/${image.path}`, image.data);
    }
  }

  dialog.showMessageBox(null, {
    message: `Png images extracted successfully. Extracted ${images.length} images.`,
    type: "info",
  });
};

const saveRcc = async (filePath) => {
  if (images.length === 0) {
    return;
  }

  filePath = filePath || loadedFilePath;

  const localPath = `${path.resolve(getResourcePath(), "rcc")}`;

  // create .qrc file
  let data = `<!DOCTYPE RCC><RCC version="1.0">\n<qresource>\n`;

  for (const image of images) {
    data += `<file>${image.path}</file>\n`;
  }

  data += `</qresource>\n</RCC>`;

  await fs.outputFileAsync(`${localPath}/res/res.qrc`, data);

  // dump images
  for (const image of images) {
    await fs.outputFileAsync(`${localPath}/res/${image.path}`, image.data);
  }

  const result = await execFile(
    `${localPath}/rcc.exe`,
    [
      "--format-version",
      "1",
      "--binary",
      `./res/res.qrc`,
      "-o",
      "./res/res_output.rcc",
    ],
    {
      cwd: `${localPath}/`,
    }
  );

  await fs.move("./rcc/res/res_output.rcc", `${filePath}`, { overwrite: true });

  // cleanup
  await fs.rmdir(`${localPath}/res`, { recursive: true });

  dialog.showMessageBox(null, {
    message: `Rcc saved successfully.`,
    type: "info",
  });
};

const replaceImage = async (index, filePath) => {
  const image = images[index];
  if (!image) {
    return null;
  }

  image.data = Buffer.from(await fs.readFile(filePath, "binary"), "binary");
  return image.data;
};

const getImageByIndex = (index) => {
  return images[index]?.data;
};

module.exports = {
  loadRcc,
  saveRcc,
  replaceImage,
  getImageByIndex,
  extractToPng,
};
