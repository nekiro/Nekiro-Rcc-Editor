import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import MakerRpm from "@electron-forge/maker-rpm";

const config: ForgeConfig = {
	makers: [
		new MakerSquirrel(
			{
				authors: "Electron contributors",
				name: "rcc_editor",
			},
			["win32"],
		),
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
							js: "./src/renderer/index.js",
							preload: {
								js: "./src/preload.js",
							},
						},
					],
				},
			},
		},
	],
};

export default config;
