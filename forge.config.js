const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

module.exports = {
	packagerConfig: {
		asar: true,
		icon: "./icon",
		executableName: "read-and-write-xml",
		appCopyright: "Copyright © 2024",
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-zip",
		},
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				name: "read_and_write_xml",
				icon: "./icon",
			},
		},
	],

	plugins: [
		{
			name: "@electron-forge/plugin-auto-unpack-natives",
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
	publishers: [
		{
			name: "@electron-forge/publisher-github",
			config: {
				repository: {
					owner: "JoseCarlos00",
					name: "read-and-write-xml",
				},
			},
			prerelease: true,
			generateReleaseNotes: true,
		},
	],
};
