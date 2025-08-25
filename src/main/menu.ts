import { app, BrowserWindow, dialog, shell } from "electron";
import path from "path";
import { extractToPng, loadRcc, saveRcc } from "./rcc";

const loadFile = async (mainWindow: BrowserWindow) => {
	const result = await dialog.showOpenDialog(mainWindow, {
		defaultPath: path.join(app.getPath("appData"), "../Local/Tibia/packages/Tibia/bin"),
		properties: ["openFile"],
		filters: [{ name: "Rcc File Type", extensions: ["rcc"] }],
	});

	if (!result.canceled) {
		const files = await loadRcc(result.filePaths[0]);

		mainWindow.webContents.send(
			"list:images",
			files.map((image) => ({
				...image,
				data: Buffer.from(image.data).toString("base64"),
			})),
		);
	}
};

const saveFile = async (mainWindow: BrowserWindow) => {
	const result = await dialog.showSaveDialog(mainWindow, {
		filters: [{ name: "Rcc File Type", extensions: ["rcc"] }],
	});

	if (!result.canceled) {
		await saveRcc(result.filePath);
	}
};

const exportAssets = async (mainWindow: BrowserWindow) => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ["openDirectory", "createDirectory"],
	});

	if (!result.canceled) {
		const ret = await extractToPng(result.filePaths[0]);
		if (ret) {
			dialog.showMessageBox(mainWindow, {
				message: `Extracted ${ret.count} images successfully.`,
				type: "info",
			});
		} else {
			dialog.showErrorBox("Error", "Nothing to extract.");
		}
	}
};

export default function createMenu(mainWindow: BrowserWindow): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] {
	return [
		{
			label: "File",
			submenu: [
				{
					label: "Load",
					click: () => loadFile(mainWindow),
				},
				{ type: "separator" },
				{
					label: "Save",
					click: () => saveRcc(),
				},
				{
					label: "Save as",
					click: () => saveFile(mainWindow),
				},
				{ type: "separator" },
				{
					label: "Export assets",
					click: () => exportAssets(mainWindow),
				},
			],
		},
		{
			label: "Donate",
			click: () => shell.openExternal("https://github.com/sponsors/nekiro"),
		},
		{
			label: "Credits",
			click: () =>
				dialog.showMessageBox(mainWindow, {
					message: "Created and developed by Nekiro\n\nhttps://github.com/nekiro",
				}),
		},
	];
}
