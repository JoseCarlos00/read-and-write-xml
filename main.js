const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron/main");
// const { autoUpdater, AppUpdater } = require("electron-updater");

const path = require("node:path");
const fs = require("node:fs");
const xml2js = require("xml2js");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow = null;
let currentFilePath = null;

//Basic flags
// autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = true;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: isDev ? 1250 : 500,
		icon: path.join(__dirname, "icon.ico"),

		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	Menu.setApplicationMenu(mainMenu);

	mainWindow.loadFile("index.html");

	// Show devtools automatically if in development
	// if (isDev) {
	// 	mainWindow.webContents.openDevTools();
	// }

	mainWindow.webContents.on("context-menu", () => {
		contextTemplate.popup(mainMenu.webContents);
	});
}

app.whenReady().then(() => {
	createMainWindow();

	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
	});

	// autoUpdater.checkForUpdates();
	showMessage(`Checking for updates. Current version ${app.getVersion()}`);
});

function showMessage(message) {
	console.log("showMessage trapped");
	console.log(message);
	mainWindow.webContents.send("updateMessage", message);
}

// /*New Update Available*/
// autoUpdater.on("update-available", (info) => {
// 	showMessage(`Actualización disponible. Versión actual ${app.getVersion()}`);
// 	let pth = autoUpdater.downloadUpdate();
// 	showMessage(pth);
// });

// autoUpdater.on("update-not-available", (info) => {
// 	showMessage(`No hay actualizaciones disponibles. Versión actual ${app.getVersion()}`);
// });

// /*Download Completion Message*/
// autoUpdater.on("update-downloaded", (info) => {
// 	showMessage(`Actualización descargada. Versión actual ${app.getVersion()}`);
// });

// autoUpdater.on("error", (info) => {
// 	showMessage(info);
// });

app.on("window-all-closed", () => {
	if (!isMac) app.quit();
});

const parser = new xml2js.Parser();

// Funcion para abrir un archivo y retornarlo
async function selectFile() {
	try {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ["openFile"],
			filters: [{ name: "Archivos XML", extensions: ["xml", "shxmlP", "shxml"] }],

			title: "Selecione un  archivo XML",
			buttonLabel: "Abrir",
		});

		if (canceled || filePaths.length === 0) {
			return null;
		}

		const filePath = filePaths[0];
		const fileContent = fs.readFileSync(filePath, "utf-8");

		if (!fileContent) return null;

		// Actualizar la ruta actual después de guardar como
		currentFilePath = filePath;

		// Extraer el nombre del archivo
		const fileName = path.basename(filePath);

		// Devuelve una promesa que se resuelve con el resultado del análisis XML
		return new Promise((resolve, reject) => {
			parser.parseString(fileContent, function (err, result) {
				if (err) {
					reject(err);
				} else {
					const data = result?.WMWROOT?.WMWDATA?.[0]?.Shipments?.[0]?.Shipment?.[0];
					resolve({ ShipmentOriginal: result, shipment: data, fileName });
				}
			});
		});
	} catch (error) {
		console.error("Error:", error);
	}
}

// Función para guardar archivo como
async function saveFileAs(event, { content, fileName = "archivo.xml" }) {
	try {
		if (!content) {
			throw new Error("No existe el  contenido para guardar");
		}

		const result = await dialog.showSaveDialog({
			title: "Guardar archivo como",
			defaultPath: fileName,
		});

		if (!result.canceled && result.filePath) {
			console.log("in:", result);
			try {
				fs.writeFileSync(result.filePath, content, "utf-8");

				// Actualizar la ruta actual después de guardar como
				currentFilePath = result.filePath;

				return { success: true, filePath: result.filePath };
			} catch (error) {
				console.error("Error al guardar el archivo:", error);
				return { success: false, error: error.message };
			}
		}

		return { success: false, error: "El usuario canceló la acción" };
	} catch (error) {
		console.error("Error en el diálogo de guardar:", error);
		return { success: false, error: "Error al  guardar el archivo" };
	}
}

// Funcion para guardar remplazando el archivo actual
async function saveFile(event, { content, fileName = "archivo.xml" }) {
	try {
		if (!content) {
			throw new Error("No hay contenido para guardar");
		}

		if (!currentFilePath) {
			// Si no hay ruta actual, llama a "Guardar como" en su lugar
			return saveFileAs(event, { content });
		}

		// Sobrescribir el archivo en la ruta actual
		fs.writeFileSync(currentFilePath, content, "utf-8");
		return { success: true, filePath: currentFilePath };
	} catch (error) {
		console.error("Error al guardar el archivo:", error);
		return { success: false, error: error.message };
	}
}

// Manejar el evento 'select-file' para abrir el diálogo y leer el archivo
ipcMain.handle("dialog:select-file", selectFile);
ipcMain.handle("dialog:save-file", saveFile);
ipcMain.handle("dialog:save-file-as", saveFileAs);

// Crear el menú de la aplicación
const mainMenu = Menu.buildFromTemplate([
	{
		label: "Archivo",
		submenu: [
			{
				label: "Abrir archivo",
				accelerator: "CmdOrCtrl+O",
				click: () => {
					mainWindow.webContents.send("menu-open-file");
				},
			},
			{
				label: "Guardar archivo",
				accelerator: "CmdOrCtrl+S",
				click: () => {
					mainWindow.webContents.send("menu-save-file");
				},
			},
			{
				label: "Guardar Archivo Como",
				accelerator: "CmdOrCtrl+Shift+S",
				click: () => {
					mainWindow.webContents.send("menu-save-file-as");
				},
			},
			{ type: "separator" },
			isMac ? { role: "close" } : { role: "quit" },
		],
	},
	{
		label: "Configuracion",
		submenu: [
			{
				label: "Selecionar carpeta de destino",
			},
		],
	},
	{
		label: "Edit",
		submenu: [
			{ role: "undo" },
			{ role: "redo" },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
		],
	},
	// { role: 'windowMenu' }
	{
		label: "Window",
		submenu: [
			{ role: "minimize" },
			{ role: "zoom" },
			...(isMac
				? [{ type: "separator" }, { role: "front" }, { type: "separator" }, { role: "window" }]
				: [{ role: "close" }]),
		],
	},
	// { role: 'viewMenu' }
	isDev
		? {
				label: "View",
				submenu: [
					{ role: "reload" },
					{ role: "forceReload" },
					{ role: "toggleDevTools" },
					{ type: "separator" },
					{ role: "resetZoom" },
					{ role: "zoomIn" },
					{ role: "zoomOut" },
					{ type: "separator" },
					{ role: "togglefullscreen" },
				],
		  }
		: "",
]);

const contextTemplate = Menu.buildFromTemplate([
	{
		label: "Abrir archivo",
		accelerator: "CmdOrCtrl+O",
		click: () => {
			mainWindow.webContents.send("menu-open-file");
		},
	},
	{
		label: "Guardar archivo",
		accelerator: "CmdOrCtrl+S",
		click: () => {
			mainWindow.webContents.send("menu-save-file");
		},
	},
	{
		label: "Guardar Archivo Como",
		accelerator: "CmdOrCtrl+Shift+S",
		click: () => {
			mainWindow.webContents.send("menu-save-file-as");
		},
	},
	{
		type: "separator",
	},
	{
		role: "close",
	},
	{
		role: "reload",
	},
]);
