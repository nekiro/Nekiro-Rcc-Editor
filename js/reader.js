const { dialog, BrowserWindow, app } = require("electron");
const path = require("path");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);
const fs = require("fs-extra");

let loadedFilePath = null;
let images = [];

const imageExt = [".png", ".jpg"];

const resourcePath = app.isPackaged ? process.resourcesPath : ".";

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
  const localPath = `${path.resolve(resourcePath, "rcc")}`;

  // clear previous images
  images = [];

  // delete res directory
  try {
    await fs.rmdir(path.join(localPath, "qresource"), { recursive: true });
  } catch {}

  await fs.copyFile(filePath, path.join(localPath, "res.rcc"));

  await execFile(path.join(localPath, "rcc.exe"), ["--reverse"], {
    cwd: `${localPath}/`,
  });

  // get directory content
  const files = await getFiles(
    path.join(localPath, "qresource", "res", "res.rcc")
  );

  for (const file of files) {
    images.push({
      name: path.parse(file.name).name,
      path: path.relative(
        path.join(localPath, "qresource", "res", "res.rcc"),
        file.path
      ),
      isImage: imageExt.includes(path.extname(file.path)),
      data: Buffer.from(await fs.readFile(file.path, "binary"), "binary"),
    });
  }

  // sort by name
  images.sort((a, b) => a.name.localeCompare(b.name));

  // cleanup
  await fs.rmdir(path.join(localPath, "qresource"), { recursive: true });
  await fs.rm(path.join(localPath, "res.rcc"));

  loadedFilePath = filePath;

  BrowserWindow.getAllWindows()[0].webContents.send("populate-list", images);
};

const extractToPng = async (directoryPath) => {
  if (!images.length) {
    dialog.showErrorBox("Error", "Nothing to extract.");
    return;
  }

  for (const image of images) {
    if (image.isImage) {
      await fs.outputFile(`${directoryPath}/${image.path}`, image.data);
    }
  }

  dialog.showMessageBox(null, {
    message: `Png images extracted successfully. Extracted ${images.length} images.`,
    type: "info",
  });
};

const saveRcc = async (filePath = loadedFilePath) => {
  if (images.length === 0) {
    return;
  }

  const localPath = path.resolve(resourcePath, "rcc");

  // create .qrc file
  let data = `<!DOCTYPE RCC><RCC version="1.0">\n<qresource>\n`;

  for (const image of images) {
    data += `<file>${image.path}</file>\n`;
  }

  data += `</qresource>\n</RCC>`;

  await fs.outputFile(path.join(localPath, "res", "res.qrc"), data);

  // dump images
  for (const image of images) {
    await fs.outputFile(path.join(localPath, "res", image.path), image.data);
  }

  await execFile(
    path.join(localPath, "rcc.exe"),
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

  await fs.move("./rcc/res/res_output.rcc", filePath, { overwrite: true });

  // cleanup
  await fs.rmdir(path.join(localPath, "res"), {
    recursive: true,
  });

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
