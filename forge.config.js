const { MakerDeb } = require("@electron-forge/maker-deb");
const { MakerSquirrel } = require("@electron-forge/maker-squirrel");
const { MakerZIP } = require("@electron-forge/maker-zip");
const { MakerRpm } = require("@electron-forge/maker-rpm");

const config = {
	packagerConfig: {
		icon: "./assets/icon.ico",
		extraResource: "./rcc",
		asar: true,
	},
	makers: [
		new MakerSquirrel({
			authors: "Nekiro",
			name: "rcc_editor",
		}),
		new MakerZIP({}, ["darwin"]),
		new MakerDeb({}, ["linux"]),
		new MakerRpm({}, ["linux"]),
	],
	plugins: [
		{
			name: "@electron-forge/plugin-webpack",
			config: {
				mainConfig: "./webpack.main.config.js",
				renderer: {
					config: "./webpack.renderer.config.js",
					entryPoints: [
						{
							name: "main_window",
							html: "./src/renderer/index.html",
							js: "./src/renderer/app.tsx",
							preload: {
								js: "./src/renderer/preload.ts",
							},
						},
					],
				},
			},
		},
	],
};

module.exports = config;
